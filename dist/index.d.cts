import { Server } from 'http';
import { Express } from 'express';
import { Task, Stream, Operation, Context } from 'effection';

/**
 * Information about a running Express server
 */
interface ServerInfo {
    hostname: string;
    port: number;
    app: Express;
    server: Server;
    task: Task<void>;
    startedAt: Date;
}
/**
 * Server events emitted by the pool (lspx-style signal events)
 */
type ServerEvent = {
    type: 'started';
    hostname: string;
    port: number;
} | {
    type: 'stopped';
    hostname: string;
} | {
    type: 'error';
    hostname: string;
    error: Error;
    message: string;
};
/**
 * The server pool interface exposed to consumers.
 *
 * Refactored to use Promise-based API (not Operation) for easier integration
 * with Express handlers and other async code.
 */
interface ServerPool {
    /**
     * Get an existing server or create a new one for the hostname.
     * Returns a Promise for easy use in async handlers.
     */
    getOrCreate(hostname: string): Promise<ServerInfo>;
    /**
     * Get server info if it exists (sync)
     */
    get(hostname: string): ServerInfo | undefined;
    /**
     * List all running servers (sync)
     */
    list(): ServerInfo[];
    /**
     * Shutdown a specific server
     */
    shutdown(hostname: string): Promise<void>;
    /**
     * Event stream for server lifecycle events.
     * Subscribe to receive notifications when servers start/stop/error.
     *
     * @example
     * ```typescript
     * yield* spawn(function*() {
     *   for (const event of yield* each(pool.events)) {
     *     console.log(`[Event] ${event.type}:`, event);
     *     yield* each.next();
     *   }
     * });
     * ```
     */
    events: Stream<ServerEvent, void>;
}
/**
 * Configuration for the switchboard
 */
interface SwitchboardConfig {
    port: number;
    defaultHostname?: string;
}
/**
 * Configuration for individual app servers
 */
interface AppServerConfig {
    hostname: string;
    port: number;
}

interface ExpressServerHandle {
    app: Express;
    server: Server;
    port: number;
    hostname: string;
}
/**
 * Error thrown when a daemon server unexpectedly closes or errors.
 */
declare class ServerDaemonError extends Error {
    readonly hostname: string;
    readonly port: number;
    readonly cause?: Error;
    constructor(hostname: string, port: number, cause?: Error);
}
/**
 * Creates an Express server as an Effection resource.
 *
 * The server will be automatically closed when the operation ends.
 * Uses graceful shutdown - waits for server to fully close before continuing.
 *
 * @param port - Port to listen on
 * @param hostname - Hostname for this server (used in responses)
 */
declare function useExpressServer(port: number, hostname: string): Operation<ExpressServerHandle>;
/**
 * Creates an Express server daemon - like useExpressServer but throws if
 * the server unexpectedly closes or errors.
 *
 * This follows the lspx useDaemon pattern: a background task watches the
 * server and throws ServerDaemonError if it dies unexpectedly.
 *
 * @param port - Port to listen on
 * @param hostname - Hostname for this server (used in responses)
 */
declare function useExpressServerDaemon(port: number, hostname: string): Operation<ExpressServerHandle>;

/**
 * Context for accessing the server pool from any operation
 */
declare const ServerPoolContext: Context<ServerPool>;
/**
 * Configuration for the server pool
 */
interface ServerPoolConfig {
    /** Starting port for dynamic servers */
    basePort: number;
    /** Maximum number of servers to spawn */
    maxServers?: number;
}
/**
 * Creates a server pool resource that manages dynamic Express servers.
 *
 * Refactored with lspx patterns:
 * - Signal-based events for observability (subscribe to pool.events)
 * - Clean Promise-based getOrCreate API (no Operation wrapper needed)
 * - Channel-based spawn worker for clean async bridging
 * - Daemon pattern for server health monitoring
 *
 * The pool:
 * - Tracks servers by hostname
 * - Assigns ports dynamically starting from basePort
 * - Spawns new servers as child tasks (so they auto-cleanup)
 * - Emits events when servers start/stop/error
 * - Cleans up all servers when the pool is shut down
 */
declare function useServerPool(config: ServerPoolConfig): Operation<ServerPool>;

interface SwitchboardHandle {
    app: Express;
    server: Server;
    port: number;
}
/**
 * Creates the switchboard proxy resource.
 *
 * The switchboard:
 * - Listens on the main port
 * - Extracts hostname from requests
 * - Creates backend servers on demand via the pool
 * - Proxies requests to the appropriate backend
 */
declare function useSwitchboard(config: SwitchboardConfig, pool: ServerPool): Operation<SwitchboardHandle>;

export { type AppServerConfig, type ExpressServerHandle, ServerDaemonError, type ServerEvent, type ServerInfo, type ServerPool, type ServerPoolConfig, ServerPoolContext, type SwitchboardConfig, type SwitchboardHandle, useExpressServer, useExpressServerDaemon, useServerPool, useSwitchboard };
