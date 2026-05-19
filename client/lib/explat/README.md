# ExPlat Client Implementation

This package exposes the API for using Automattic's ExPlat (Experimentation Platform).

## In React

- `Experiment` Component - The simplest way to experiment, but too simple for all applications.
- `useExperiment` Hook - For when you are doing something more complicated in a hook context.
- `ProvideExperimentData` HOC - For when hooks aren't available.

[See the `explat-client-react-helpers` package for details.](https://github.com/Automattic/wp-calypso/blob/trunk/packages/explat-client-react-helpers/README.md)

## Outside React

- `loadExperimentAssignment` - Load experiment data as a promise.
- `dangerouslyGetExperimentAssignment` - Try and get an experiment assignment even if it hasn't loaded yet.
- `getFeatureValue` - Resolve a typed feature-flag value, evaluated client-side. See below.

[See the `explat-client` package for details](https://github.com/Automattic/wp-calypso/blob/trunk/packages/explat-client/README.md)

## Feature flags

`getFeatureValue( flagKey, defaultValue )` returns a typed value for a flag defined in the wpcom `experiment_flags` table. Values may be strings, booleans, numbers, arrays, or objects, matching the flag's `value_type`.

```ts
import { getFeatureValue } from 'calypso/lib/explat';

const enabled = await getFeatureValue( 'new_checkout_flow', false );
if ( enabled ) {
	// new flow
}
```

Create flags via the `explat/create-feature-flag` MCP ability or by talking to whoever owns the flag registry. Calls against an unknown or archived flag, a failed payload fetch, or a flag with no matching rule return the supplied `defaultValue`.

Behavior:

- The public static flag payload (rules only, no request attributes) is fetched once per session and cached per its TTL.
- Request-specific runtime state comes from private wpcom bootstrapping via `window.__EXPLAT_RUNTIME__`. Missing runtime is tolerated; logging only fires on wpcom backends that emit it.
- Force-rule matches return immediately with no Tracks event.
- Experiment-rule matches return the typed value associated with the assigned variation and beacon to `POST /assignments/log`. The server recomputes and verifies before writing Tracks.

## Tips

- Mix and match as much as you need :-)
- `loadExperimentAssignment` can be added at Calypso boot to prefetch the experiment and avoid loading state.
- Everything but `dangerouslyGetExperimentAssignment` can be used to prefetch an experiment assignment.
