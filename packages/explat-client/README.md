⚠️ **You probably shouldn't be using this package directly.**

Search for `createExPlatClient` within your codebase to find your platform's implementation.

# ExPlat Client

This is a standalone client for Automattic's ExPlat, allowing use of ExPlat in any Javascript context.

## Self-Contained

`const exPlatClient = createExPlatClient(config)`

- Dep injects outside parts so it can be fitted to any codebase.
- Doesn't assume much of its environment.
- No external dependencies or libs need.
- Stores state in LocalStorage if available otherwise in memory.

## Type: `ExperimentAssignment`

`ExperimentAssignment` represents an experiment assignment, as an experimenter you just need to look at `ExperimentAssignment.variationName`.

- `variationName === null`: This means you should return the default experience.
- `variationName !== null`: This means you should return the treatment experience. Currently `variationName` will always be `treatment`, but this may change.

This type will likely be extended, it can also be missing in some API functions, particularly in the React side of things. A missing experiment assignment _does not_ mean the default experience, it means we do not have an assignment yet and if we can afford to wait we should, generally displaying a loading experience.

## API: `exPlatClient.loadExperimentAssignment`

### Type signature

`loadExperimentAssignment: (experimentName: string) => Promise<ExperimentAssignment>`

### Usage

```
const experimentAssignment = await loadExperimentAssignment('experiment_name')
```

- Call as many times and as much as you like, we manage the state and requests.
- Use earlier in code to prefetch the experimentAssignment.
- Try not to use it in SSR contexts, but it will not crash anything if it does and we will log these cases.
- Respects the server returned TTL (3600 seconds in production at the time of writing).
- The promise non-resolution/resolution is the loading state.
- Designed to never throw

## API: `exPlatClient.dangerouslyGetExperimentAssignment`

### Type signature

`dangerouslyGetExperimentAssignment: ( experimentName: string ) => ExperimentAssignment`

### Usage

```
// An experiment MUST be loaded beforehand:
loadExperimentAssignment( 'experiment_name' );

// Then, significantly enough in the future for the loading to have occurred:
const experimentAssignment = dangerouslyGetExperimentAssignment( 'experiment_name' );
```

This is an "asyncronous escape hatch", allowing you to use ExPlat in more synchronous code such as within `/lib`.

- Gets but won't load/assign an experiment assignment.
- ~~MUST be wrapped in a try-catch block.~~ It now logs and won't throw.
- Named so it is easy to spot in a code review.

Checklist for use:

- [ ] Does `loadExperimentAssignment` get called before `dangerouslyGetExperimentAssignment` gets called.
- [ ] Does `loadExperimentAssignment` get called significantly before it (minimum 2 seconds looking at perf data, 5-10 seconds is best).
- [ ] ~~Is `dangerouslyGetExperimentAssignment` wrapped in a try-catch block~~
- [ ] Are there no `console.log` errors being emitted?

## ExPlat SDK (`ExPlatSdk` namespace)

A pure TypeScript port of the WPCOM PHP feature-flag evaluator. Self-contained, byte-deterministic, no I/O — same inputs, same answers, every runtime. Lives in `src/sdk/` and is re-exported from `@automattic/explat-client` under the `ExPlatSdk` namespace so SDK names don't collide with the existing `loadExperimentAssignment` API.

## Cross-runtime parity

`src/sdk/test/cases.json` is the wire-protocol contract. The same vectors run against the PHP SDK in WPCOM; if either runtime drifts, both repos' CI fails. Any change to a payload shape in `types.ts` must be mirrored in PHP and exercised by a vector.

When updating `cases.json`, the file must stay byte-identical with the copy in the WPCOM PHP repo. Run prettier here, then sync the formatted file there.

`SDK_VERSION` (in `src/sdk/index.ts`) tracks the same value as the PHP `SDK_VERSION` constant — bump in lockstep across runtimes.

## Module layout

- **`hash.ts`** — FNV-1a 32-bit and the double-FNV float-in-`[0, 1)` used to map a user into a bucket. The PHP port intentionally mimics JavaScript's UTF-16 `charCodeAt` semantics; `>>> 0` at the end of `hashFnv32a` keeps the output unsigned 32-bit. Don't move the coercion — runtimes will diverge.
- **`bucket.ts`** — bucket-range construction and variation choice. Coverage is clamped to `[0, 1]`; weights that don't sum to ~1.0 fall back to an equal `1/N` split. `chooseVariation` returns the matched index or `-1` when the user is outside coverage, matching the PHP runtime and the cross-runtime `cases.json`.
- **`condition.ts`** — runtime condition matcher. Borrows MongoDB-shaped query syntax for familiarity (no MongoDB anywhere in the stack). The five MVP operators are `$eq`, `$in`, `$exists`, `$and`, `$or`. This file is the runtime evaluator only — authoring-time validation belongs elsewhere — and never crashes on bad input. Unknown operators fail closed (silent — the SDK does no I/O). An empty operator object on a field (`{ country: {} }`) is treated as non-match for parity with PHP, where decoded empty associative arrays fall into the empty-list `$in` shorthand.
- **`evaluator.ts`** — `evalFeature(feature, attrs)`. Walks a flag's rule list in order; the first rule whose condition (if any) passes and whose action resolves to a value wins. Force rules return their literal value; experiment rules hash the named identity attribute and pick a variation. No DB, no globals, no clocks, no I/O.
- **`types.ts`** — shared types. Identity slots are explicit per system (`anon_id`, `wpcom_user_id`, etc.) — there is no generic `user_id` because hashing, dedupe, and Tracks writes need an unambiguous owner.
