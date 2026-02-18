# Chapter 5.5: Final Assembly

Let's put all the pieces together and see the complete working system!

---

## The Entry Point

```typescript
// start.ts
import { main, suspend, spawn, each } from "effection";
import { useServerPool } from "./src/server-pool.ts";
import { useSwitchboard } from "./src/switchboard.ts";
import type { ServerEvent } from "./src/types.ts";

const SWITCHBOARD_PORT = 8000;
const BASE_SERVER_PORT = 3001;

await main(function* () {
  console.log(
    "╔══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║           Effection Multiplex HTTP Proxy                     ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝",
  );

  // Create the server pool
  const pool = yield* useServerPool({
    basePort: BASE_SERVER_PORT,
    maxServers: 10,
  });

  // Subscribe to pool events for observability
  yield* spawn(function* () {
    for (const event of yield* each(pool.events)) {
      const e = event as ServerEvent;
      switch (e.type) {
        case "started":
          console.log(
            `[Events] Server started: ${e.hostname} on port ${e.port}`,
          );
          break;
        case "stopped":
          console.log(`[Events] Server stopped: ${e.hostname}`);
          break;
        case "error":
          console.error(`[Events] Server error: ${e.hostname} - ${e.message}`);
          break;
      }
      yield* each.next();
    }
  });

  // Create the switchboard
  yield* useSwitchboard(
    { port: SWITCHBOARD_PORT, defaultHostname: "default" },
    pool,
  );

  console.log(`Switchboard ready at http://localhost:${SWITCHBOARD_PORT}`);
  console.log("Press Ctrl+C to gracefully shut down all servers.");

  // Keep running until interrupted
  yield* suspend();
});
```

---

## What Happens

1. **`main()` starts** - sets up Ctrl+C handling
2. **Server pool created** - ready to spawn servers on demand
3. **Event subscriber spawned** - logs server lifecycle events
4. **Switchboard starts** - listening on port 8000
5. **`suspend()` waits** - keeps the process alive
6. **Ctrl+C pressed** - triggers graceful shutdown
7. **All resources cleaned up** - servers close, pool shuts down

---

## The Operation Tree

```
main()
├── useServerPool (resource)
│   └── event signal
├── event subscriber (spawned task)
│   └── iterates pool.events
├── useSwitchboard (resource)
│   └── Express proxy server
└── suspend()

When pool.getOrCreate() is called:
├── useServerPool
│   └── doSpawnServer (via scope.run)
│       └── useExpressServerDaemon (resource)
│           ├── useExpressServer (resource)
│           │   └── Express backend server
│           └── daemon watcher (spawned task)
```

---

## Running It

```bash
# Install dependencies
npm install effection express http-proxy
npm install -D @types/express tsx typescript

# Run the proxy
npx tsx start.ts
```

---

## Testing It

In another terminal:

```bash
# Default app (creates "default" server on port 3001)
curl http://localhost:8000/

# Specific apps (creates new servers dynamically)
curl -H "Host: app-a.localhost" http://localhost:8000/
curl -H "Host: app-b.localhost" http://localhost:8000/
curl -H "Host: myapp.localhost" http://localhost:8000/

# Using X-App-Name header
curl -H "X-App-Name: custom" http://localhost:8000/

# Check switchboard health
curl http://localhost:8000/__switchboard/health

# List all running servers
curl http://localhost:8000/__switchboard/servers
```

---

## Sample Output

```
╔══════════════════════════════════════════════════════════════╗
║           Effection Multiplex HTTP Proxy                     ║
╚══════════════════════════════════════════════════════════════╝
[Pool] Server pool ready (base port: 3001)
[Switchboard] Listening on port 8000
Switchboard ready at http://localhost:8000

[Switchboard] Request for hostname: "default"
[Pool] Creating server for "default" on port 3001
[default] Server started on port 3001
[Events] Server started: default on port 3001
[Switchboard] Proxying GET / -> default

[Switchboard] Request for hostname: "app-a"
[Pool] Creating server for "app-a" on port 3002
[app-a] Server started on port 3002
[Events] Server started: app-a on port 3002
[Switchboard] Proxying GET / -> app-a

^C
[Pool] Shutting down all servers...
[Pool] 2 server(s) will be cleaned up
[default] Closing server on port 3001...
[app-a] Closing server on port 3002...
[Events] Server stopped: default
[Events] Server stopped: app-a
[default] Server closed
[app-a] Server closed
[Switchboard] Closing proxy server...
[Switchboard] Proxy server closed
```

---

## Effection Concepts Used

| Concept       | Where Used                                      |
| ------------- | ----------------------------------------------- |
| `main()`      | Entry point, Ctrl+C handling                    |
| `resource()`  | Server pool, switchboard, individual servers    |
| `spawn()`     | Event subscriber, server tasks                  |
| `useScope()`  | Pool captures scope for spawning from handlers  |
| `scope.run()` | Bridging Express handlers → Effection           |
| `Context`     | Sharing pool via `ServerPoolContext`            |
| `Signal`      | Event streaming from pool                       |
| `each()`      | Consuming event stream                          |
| `suspend()`   | Keeping main alive                              |
| `call()`      | Bridging Promises (server.listen, server.close) |
| `ensure()`    | Cleanup logging (in server resource)            |

---

## The Guarantee

When you press Ctrl+C:

1. `main()` receives the signal
2. All child operations are halted
3. All `finally` blocks run
4. All servers close gracefully
5. Process exits cleanly

**No leaked connections. No orphaned servers. No dangling timers.**

---

## Adding Resilience with `scoped()`

What happens if one backend server crashes? Without error boundaries, it would take down the entire pool—and with it, every other server. That's like a fire in one apartment burning down the whole building.

The fix: wrap each server in `scoped()` to create **fire doors** that contain failures:

```typescript
// In server-pool.ts, the doSpawnServer function could be wrapped:
function* createResilientServer(
  hostname: string,
): Operation<ServerInfo | null> {
  try {
    return yield* scoped(function* () {
      // This server runs in its own error boundary
      const server = yield* useExpressServerDaemon(hostname, port);
      return server;
    });
  } catch (error) {
    // Log the failure but don't crash the pool
    console.error(
      `[Pool] Server "${hostname}" failed: ${(error as Error).message}`,
    );
    events.send({ type: "error", hostname, message: (error as Error).message });
    return null;
  }
}
```

With this pattern:

- A crashing server emits an error event and returns `null`
- The pool continues running other servers
- The switchboard can handle the missing server gracefully
- Other tenants are unaffected by one tenant's crash

### The Fire Doors Mental Model

Think of `scoped()` as fire doors in our apartment building:

```
┌────────────────────────────────────────────────────────────┐
│                        ServerPool                          │
│                                                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ scoped() │    │ scoped() │    │ scoped() │  ← Fire      │
│  │  ┌────┐  │    │  ┌────┐  │    │  ┌────┐  │    doors     │
│  │  │app-a│  │    │  │app-b│  │    │  │app-c│  │              │
│  │  │ 🔥 │  │    │  │ ✓  │  │    │  │ ✓  │  │              │
│  │  └────┘  │    │  └────┘  │    │  └────┘  │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │                │                │                  │
│       ▼                │                │                  │
│   Contained!           │                │                  │
│   (emits error)        │                │                  │
│                        ▼                ▼                  │
│                    Still serving requests!                 │
└────────────────────────────────────────────────────────────┘
```

When `app-a` catches fire:

1. The fire doors (`scoped()`) slam shut
2. `app-a` is cleaned up and removed from the pool
3. An error event is emitted for observability
4. `app-b` and `app-c` continue serving traffic
5. The switchboard returns 503 for `app-a` requests

This is the difference between "one bad tenant" and "building evacuation."

---

## What We Built

```
┌─────────────────────────────────────────────────────────────────┐
│                          main()                                 │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Switchboard (Port 8000)                   │ │
│  │  - Receives all incoming HTTP requests                     │ │
│  │  - Parses Host header to determine target                  │ │
│  │  - Proxies request to appropriate backend server           │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                   │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │                    ServerPool Resource                     │ │
│  │  - Manages Map<hostname, ServerInfo>                       │ │
│  │  - Spawns new Express servers on demand                    │ │
│  │  - Assigns dynamic ports (3001, 3002, ...)                 │ │
│  │  - Emits events via Signal                                 │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                   │
│     ┌───────────────────────┼───────────────────────┐           │
│     │                       │                       │           │
│     ▼                       ▼                       ▼           │
│  ┌──────┐               ┌──────┐               ┌──────┐         │
│  │app-a │               │app-b │               │app-c │         │
│  │:3001 │               │:3002 │               │:3003 │         │
│  └──────┘               └──────┘               └──────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Congratulations!

You've built a production-style application using Effection's structured concurrency. You now understand:

- **Operations** - lazy, composable async
- **Actions** - bridging callbacks
- **Spawn** - child tasks
- **Resources** - long-lived services with cleanup
- **Channels & Signals** - communication
- **Streams** - unified async iteration
- **Context** - dependency injection
- **Scope API** - framework integration

Most importantly, you understand **why** Effection exists: to make async JavaScript reliable, predictable, and safe.

---

## Going Further

- Read the [Effection documentation](https://frontside.com/effection)
- Explore the [source code](../../src/) of this capstone
- Build your own resources for databases, queues, WebSockets
- Contribute to the Effection project!

**Happy coding!**
