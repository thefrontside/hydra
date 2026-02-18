# The World's Greatest Effection Tutorial

**Learn structured concurrency by building a multiplex HTTP proxy**

[![Validated](https://img.shields.io/badge/Effection-v4%20Validated-green)](https://github.com/thefrontside/effection)

---

## What You'll Learn

Ever written async code that leaked connections, orphaned timers, or left servers running after Ctrl+C? You're not alone. JavaScript's `async/await` feels great—until it doesn't.

Effection is a structured concurrency library that fixes this by guaranteeing:

1. **No operation runs longer than its parent** - automatic cleanup
2. **Every operation exits fully** - `finally` blocks always run
3. **It's just JavaScript** - use `if`, `for`, `while`, `try/catch` as normal

By the end of this tutorial, you'll build a **multiplex HTTP proxy** that dynamically spawns Express servers and routes requests through a switchboard - all managed by Effection.

---

## Tutorial Structure

### Part 1: Foundation - "Why Effection Exists"

| Chapter                                    | Topic                        | Run Examples                                  |
| ------------------------------------------ | ---------------------------- | --------------------------------------------- |
| [01](./chapters/01-problem-with-promises/) | The Problem with Promises    | `npx tsx chapters/01-*/leaky-race.ts`         |
| [02](./chapters/02-operations/)            | Operations                   | `npx tsx chapters/02-*/countdown.ts`          |
| [03](./chapters/03-actions/)               | Actions - Bridging Callbacks | `npx tsx chapters/03-*/sleep-with-logging.ts` |

### Part 2: Concurrency - "Doing Many Things at Once"

| Chapter                          | Topic                             | Run Examples                               |
| -------------------------------- | --------------------------------- | ------------------------------------------ |
| [04](./chapters/04-spawn/)       | Spawn - Child Operations          | `npx tsx chapters/04-*/spawn-example.ts`   |
| [05](./chapters/05-combinators/) | Combinators - all() and race()    | `npx tsx chapters/05-*/timeout-pattern.ts` |
| [06](./chapters/06-resources/)   | Resources - Long-running Services | `npx tsx chapters/06-*/resource-socket.ts` |

### Part 3: Communication - "Operations Talking to Each Other"

| Chapter                       | Topic                           | Run Examples                                      |
| ----------------------------- | ------------------------------- | ------------------------------------------------- |
| [07](./chapters/07-channels/) | Channels                        | `npx tsx chapters/07-*/channel-basics.ts`         |
| [08](./chapters/08-signals/)  | Signals - Events from Callbacks | `npx tsx chapters/08-*/signal-basics.ts`          |
| [09](./chapters/09-streams/)  | Streams - The Unifying Concept  | `npx tsx chapters/09-*/stream-vs-subscription.ts` |
| [10](./chapters/10-context/)  | Context - Sharing Values        | `npx tsx chapters/10-*/context-basics.ts`         |

### Part 4: Integration

| Chapter                        | Topic                                                   |
| ------------------------------ | ------------------------------------------------------- |
| [11](./chapters/11-scope-api/) | Scope API - Embedding Effection in Express, React, etc. |

### Part 5: Capstone - Multiplex HTTP Proxy

| Section                                                  | Topic                                |
| -------------------------------------------------------- | ------------------------------------ |
| [Overview](./capstone/)                                  | Architecture and what we're building |
| [Server Resource](./capstone/docs/01-server-resource.md) | Wrapping Express as a resource       |
| [Server Pool](./capstone/docs/02-server-pool.md)         | Managing dynamic servers             |
| [Switchboard](./capstone/docs/03-switchboard.md)         | Routing requests                     |
| [Final Assembly](./capstone/docs/04-final-assembly.md)   | Putting it all together              |

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/thefrontside/hydra.git
cd hydra
npm install

# Start the tutorial
cd chapters/01-problem-with-promises
cat README.md

# Run an example
npx tsx leaky-race.ts

# Run the capstone project
cd ../../capstone
npx tsx start.ts
```

---

## Prerequisites

- Solid JavaScript/TypeScript knowledge
- Familiarity with `async/await`
- Basic understanding of Node.js
- Experience with Express is helpful but not required

---

## Repository Structure

```
hydra/
├── chapters/                 # Tutorial chapters (concepts + examples)
│   ├── 01-problem-with-promises/
│   │   ├── README.md         # Chapter content
│   │   ├── leaky-race.ts     # Runnable example
│   │   └── ...
│   ├── 02-operations/
│   ├── ...
│   └── 11-scope-api/
│
├── capstone/                 # The multiplex proxy project
│   ├── README.md             # Architecture overview
│   ├── docs/                 # Implementation guides
│   ├── src/                  # Source code
│   └── start.ts              # Entry point
│
└── README.md                 # You are here
```

---

## Validation Status

This tutorial has been validated against:

- [Effection AGENTS.md contract](https://github.com/thefrontside/effection/blob/v4/AGENTS.md) (API correctness)
- [Official Effection documentation](https://frontside.com/effection) (best practices)
- [Frontside voice guidelines](https://github.com/thefrontside/frontside.com/blob/main/AGENTS.md) (writing style)

---

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

---

## Let's Begin!

Start with [Chapter 01: The Problem with Promises](./chapters/01-problem-with-promises/)

---

## License

MIT
