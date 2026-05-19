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

Create flags via the `explat/create-feature-flag` MCP ability. The supplied `defaultValue` is returned on any failure — unknown or archived flag, fetch error, or no matching rule.

The flag payload is fetched lazily on the first `getFeatureValue` call and cached per its TTL; subsequent calls within the TTL are local. Experiment-rule matches additionally beacon to `POST /assignments/log` so the server can write Tracks.

## Tips

- Mix and match as much as you need :-)
- `loadExperimentAssignment` can be added at Calypso boot to prefetch the experiment and avoid loading state.
- Everything but `dangerouslyGetExperimentAssignment` can be used to prefetch an experiment assignment.
