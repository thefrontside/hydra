# Effection Tutorial

A hands-on tutorial for learning [Effection](https://frontside.com/effection) - structured concurrency for JavaScript.

[![Validated](https://img.shields.io/badge/Effection-v4%20Validated-green)](https://github.com/thefrontside/effection)

## What is Effection?

Effection brings structured concurrency to JavaScript. Unlike Promises, every async operation has a clear parent-child relationship, guaranteed cleanup, and proper cancellation support.

## Validation Status

This tutorial has been validated against:

- [Effection AGENTS.md contract](https://github.com/thefrontside/effection/blob/v4/AGENTS.md) (API correctness)
- [Official Effection documentation](https://frontside.com/effection) (best practices)
- [Frontside voice guidelines](https://github.com/thefrontside/frontside.com/blob/main/AGENTS.md) (writing style)

### Fixes Applied

- `call()` → `until()` for awaiting existing promises (contract compliance)
- Type safety improvements (removed `null as any` patterns)
- Added `scoped()` error boundary documentation with fire doors metaphor
- Added Signal vs Channel decision guide with whiteboard/inbox metaphor
- Added `call()` vs `until()` section with restaurant metaphor

## Tutorial Structure

The tutorial is organized in `docs/tutorial/`:

| Chapter | Topic                     |
| ------- | ------------------------- |
| 01      | The Problem with Promises |
| 02      | Operations                |
| 03      | Actions                   |
| 04      | Spawn                     |
| 05      | Combinators (all, race)   |
| 06      | Resources                 |
| 07      | Channels & Streams        |
| 08      | Signals                   |
| 09      | Context                   |
| 10      | Scope API                 |
| 11      | Capstone Architecture     |

## Setup

```bash
npm install
```

## Running Examples

All runnable TypeScript examples are in `docs/ts/`. Run any example with:

```bash
npx tsx docs/ts/<example>.ts
```

Examples:

```bash
# Basic operations
npx tsx docs/ts/countdown.ts
npx tsx docs/ts/slow-add.ts

# Spawning concurrent tasks
npx tsx docs/ts/spawn-example.ts
npx tsx docs/ts/parallel-fetch.ts

# Combinators
npx tsx docs/ts/effection-all.ts
npx tsx docs/ts/timeout-pattern.ts

# Resources
npx tsx docs/ts/resource-socket.ts
npx tsx docs/ts/http-server-resource.ts

# Channels & Streams
npx tsx docs/ts/channel-basics.ts
npx tsx docs/ts/event-bus.ts

# Signals
npx tsx docs/ts/signal-basics.ts

# Context
npx tsx docs/ts/context-basics.ts
npx tsx docs/ts/request-context.ts
```

## Available Examples

```
docs/ts/
├── all-with-error.ts
├── api-fallback.ts
├── await-event-horizon.ts
├── channel-basics.ts
├── chat-room.ts
├── children-halted.ts
├── composed-resources.ts
├── context-basics.ts
├── context-scoped.ts
├── countdown.ts
├── database-context.ts
├── each-pattern.ts
├── effection-all.ts
├── effection-race.ts
├── emitter-events.ts
├── ensure-example.ts
├── error-propagation.ts
├── event-bus.ts
├── file-watcher.ts
├── fire-and-forget.ts
├── guaranteed-cleanup.ts
├── http-server-resource.ts
├── keyboard-stream.ts
├── leaky-race.ts
├── leaky-timers.ts
├── logger-context.ts
├── multiple-subscribers.ts
├── parallel-countdown.ts
├── parallel-fetch.ts
├── request-context.ts
├── resource-socket.ts
├── signal-basics.ts
├── sleep-with-logging.ts
├── slow-add.ts
├── spawn-example.ts
├── timeout-pattern.ts
└── xhr-fetch.ts
```

## Contributing

When contributing to this tutorial:

1. **Follow the Effection contract** - See [AGENTS.md](https://github.com/thefrontside/effection/blob/v4/AGENTS.md) for API correctness rules
2. **Use Frontside voice** - Conversational-expert tone, sustained metaphors, brief conclusions
3. **Test all examples** - Every code block should be runnable with `npx tsx`
4. **Validate changes** - Check against official Effection docs before submitting

### Key Patterns to Follow

| Pattern             | Correct                            | Incorrect                           |
| ------------------- | ---------------------------------- | ----------------------------------- |
| Existing promises   | `yield* until(promise)`            | `yield* call(() => promise)`        |
| New async work      | `yield* call(async () => {...})`   | N/A                                 |
| Error boundaries    | `yield* scoped(function*() {...})` | Uncontained errors                  |
| Operation messaging | `Channel`                          | `Signal` (use Signal for callbacks) |

## License

MIT
