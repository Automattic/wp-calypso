# Processing Step

This step can be used when there are background tasks to be done after submitting a step.
It works together with `ONBOARD_STORE` and some of its state:

- `pendingAction` - an `async function` that does the background work and returns when done.
- (optional) `progress` - a `number` >=0 and <=1 describing the progress.
- (optional) `progressTitle` - a `string` describing to the user the action being performed.

## How to use it

### Basic example

1. Identify the step that requires background work, let's call it the **"main step"**.
2. Add `processing` to the flow's step list (`useSteps()`)
3. Configure your flow in a way that the `processing` step is called after submitting the main step, something like:

```
function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
...
	switch ( currentStep ) {
		case 'myMainStep':
			return navigate( 'processing' );
...
```

4. On the main step, before calling `submit()`, set the pendingAction.
   - Remember to `await` all `Promisse`s

```
const { setPendingAction } = useDispatch( ONBOARD_STORE );

...

setPendingAction( async () => {
   // Do the work, make asynchronous requests, etc
   await goToServerAndWork();
   await doMoreWork();
});

submit?.();
```

5. Now you should get a generic processing screen after you submit the main step.

![image](https://user-images.githubusercontent.com/3801502/164056728-68713b23-5b36-410a-b226-287999f5f983.png)

### Progress bar

Instead of the ellipsis you can have a progress bar. You just need to use `setProgress`.

```
const { setPendingAction, setProgress } = useDispatch( ONBOARD_STORE );

...

setPendingAction( async () => {
   // Initialize to enable progress bar
   setProgress( 0 );

   await goToServerAndWork();
   setProgress( 35 );

   await doMoreWork();
   setProgress( 80 );

   await doEvenMoreWork();
   setProgress( 100 );
});

submit?.();
```

![image](https://user-images.githubusercontent.com/3801502/164058119-735e2e40-79f7-4753-9915-0564f794089e.png)

### Personalized text

You can also inform user about the actual steps by using `setProgressTitle`. It work with both the progress bar and the ellipsis.

```
const { setPendingAction, setProgressTitle } = useDispatch( ONBOARD_STORE );

...

setPendingAction( async () => {
   setProgressTitle( 'My cool Title' );
   await goToServerAndWork();
});

submit?.();
```

![image](https://user-images.githubusercontent.com/3801502/164059226-d8869c1b-038b-4eef-bf98-41191668109f.png)

### Progress bar + personalized text example

```
const { setPendingAction, setProgress, setProgressTitle } = useDispatch( ONBOARD_STORE );

...

setPendingAction( async () => {
   // Initialize to enable progress bar
   setProgress( 0 );

   setProgressTitle( 'Working...' );
   await goToServerAndWork();
   setProgress( 35 );

   setProgressTitle( 'Working harder!' );
   await doMoreWork();
   setProgress( 80 );

   setProgressTitle( 'Almost done' );
   await doEvenMoreWork();
   setProgress( 100 );
});

submit?.();
```

![image](https://user-images.githubusercontent.com/3801502/164059891-2d99c8ca-834b-46ca-a2c3-5752b5fe5507.png)
