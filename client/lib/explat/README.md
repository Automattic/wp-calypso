# ExPlat Client Implementation

This package exposes the API for using Automattic's ExPlat (Experimentation Platform).

## In React

- `Experiment` Component - The simplest way to experiment, but too simple for all applications.
- `useExperiment` Hook - For when you are doing something more complicated in a hook context.
- `ProvideExperimentData` HOC - For when hooks aren't available.

[See the `explat-client-react-helpers` package for details.](https://github.com/Automattic/wp-calypso/blob/trunk/packages/explat-client-react-helpers/README.md)

## Outside React

- `loadExperiment` - Load experiment data as a promise.
- `dangerouslyGetExperimentAssignment` - Try and get an experiment assignment even if it hasn't loaded yet.

[See the `explat-client` package for details](https://github.com/Automattic/wp-calypso/blob/trunk/packages/explat-client/README.md)

## Tips

- Mix and match as much as you need :-)
- `loadExperiment` can be added at Calypso boot to prefetch the experiment and avoid loading state.
- Everything but `dangerouslyGetExperimentAssignment` can be used to prefetch an experiment assignment.
