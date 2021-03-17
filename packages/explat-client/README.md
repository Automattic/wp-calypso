# ExPlat Client

This is a standalone client for Automattic's ExPlat, allowing use of ExPlat in any Javascript context.

## Self-Contained

`const exPlatClient = createExPlatClient(config)`

- Dep injects outside parts so it can be fitted to any codebase.
- Doesn't assume much of its environment.
- No external dependencies or libs need.
- Stores state internally and simply.

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
try {
	const experimentAssignment = dangerouslyGetExperimentAssignment( 'experiment_name' );
} catch ( e ) {
	// You need to ensure that this will happen very rarely, we use throwing and a try catch block
	// to indicate that this is the exception rather than the norm.
	// You MAY want to provide the default experience here.
}
```

This is an "asyncronous escape hatch", allowing you to use ExPlat in more synchronous code such as within `/lib`.

- Gets but won't load/assign an experiment assignment.
- MUST be wrapped in a try-catch block.
- Named so it is easy to spot in a code review.

Checklist for use:

- [ ] Does `loadExperiment` get called before `dangerouslyGetExperimentAssignment` gets called.
- [ ] Does `loadExperiment` get called significantly before it (minimum 2 seconds looking at perf data, 5-10 seconds is best).
- [ ] Is `dangerouslyGetExperimentAssignment` wrapped in a try-catch block
- [ ] Does the catch block gracefully handle missing ExperimentAssignments.
