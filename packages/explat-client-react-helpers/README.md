# ExPlat Client: React Helpers

This is the React Interface for the standalone client for Automattic's ExPlat. To be used in conjunction with `@automattic/explat-client`, see also the README over there.

## API: `<Experiment>`

### Type signature

`Experiment: (name: string, defaultExperience, treatmentExperience, loadingExperience) => JSX.Element `

### Usage

```
<Experiment
	name="experiment_name"
	defaultExperience={ <DefaultComponent /> }
	treatmentExperience={ <TreatmentComponent /> }
	loadingExperience={ <LoadingComponent /> }
	// Optional: See ExperimentOptions
	options={experimentOptions}
/>;
```

- The simplest and safest way to experiement, but not useful everywhere.
- For those not using typescript, make sure you provide all the Experience props.

## API: `useExperiment('experiment_name')`

### Type signature

`useExperiment: (experimentName: string) => [boolean, ExperimentAssignment | null]`

### Usage

```
const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment( 'experiment_name' );

if ( isLoadingExperimentAssignment ) {
	// Show loading experience
} else if ( experimentAssignment?.variationName === 'treatment' ) {
	// Provide treatment experience
} else {
	// Provide default experience
}
```

- Can use it on it's own, as much and wherever you would like (but it won't work in SSR)
- Won't obey TTL - will retain the same experience for the life of the component.
- Tip: Can use `loadExperimentAssignment('experiment_name')` to prefetch an experiment.

### ExperimentOptions

`useExperiment`, `<Experiment>` and `<ProvideExperimentData>` also takes an options object:

> `options.isEligible: Boolean = true`

Use this to add an in-code eligibility check to whether you want to load an experiment, if false it will return `isLoading = false && experimentAssignment = null` which (if you use the above example if-statement or the `<Experiment>` or `<ProvideExperimentData>` components) should cause the default/fallback experience to show.

It is up to you to ensure that the eligibility checks are consistent, the first eligible experiment will cause an assignment. This parameter can intuitively vary as expected for a hook or component argument, meaning that you can have the `isEligible` check be dynamic.

Example usage:

```
const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment( 'experiment_name', { isEligible: flow === 'launch-site' } );
```

> `options.assignmentIdentity: 'anon' | 'user' = 'anon'`

Controls which identifier the server buckets the experiment on. Defaults to `'anon'` (the anonymous Tracks id, set for every visitor), which means experiments are bucketed anonymously even for logged-in users.

**Logged-in-only experiences should set `assignmentIdentity: 'user'`** so the assignment is keyed on the stable `wpcom_user_id` instead of the anon id. Pair it with `isEligible` set to the logged-in state, since `'user'` mode yields no assignment when logged out. Must be stable per experiment name. See the `@automattic/explat-client` README for full details.

Example usage:

```
const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment( 'experiment_name', {
	assignmentIdentity: 'user',
	isEligible: isUserLoggedIn,
} );
```

## API: `<ProvideExperimentData>`

### Type signature

`ProvideExperimentData: (name: string, children) => JSX.Element`

### Usage

```
<ProvideExperimentData
    name="experiment_name"
	// Optional: See ExperimentOptions
	options={experimentOptions}
    >
    {(isLoading, experimentAssignment) => /* Your code here */}
</ProvideExperimentData>
```

- The same as `useExperiment` but available where hooks aren't, use `useExperiment` where available.
