<img src="https://user-images.githubusercontent.com/17054134/159939643-4a3a7893-ab38-4223-ba5d-5dfe64282f07.png" alt="Stepper logo" width="400">

# Stepper Walkthrough Framework

Stepper is a framework that allows you to make all kinds of walkthroughs. It's geared towards signup and onboarding flows. But you can use it to make all sorts of wizards.

## Table of Contents

## How does it work

A Stepper flow **is not a series of steps**, it's a graph of steps with a non-deterministic order. The first step of the flow is deterministic, but the following steps are decided on the fly by the flow depending on state (user input, user status, site status, etc...).

An ideal Stepper flow is a [finite-state machine](https://en.wikipedia.org/wiki/Finite-state_machine). Meaning it has a pre-defined set of possible states, and it should only be in one of those states at any given moment.

### The most important principle: Steps shouldn't make decisions or communicate

![StepperFlow)](https://github.com/user-attachments/assets/c8d5b07a-4172-4ba1-92d0-7821f0b6b9f0)

Stepper steps should be a lot like native form inputs. They may receive some properties, they may have internal state (think checkbox), and they must submit some information. That's it.

1. They should not make narrative decisions (go back, go next, exit flow, etc..)
2. They should not communicate with other steps (eg via query params).
3. **They should not have side effects (eg persisting stuff in local storage).**

They should _only submit_ and the flow should do all the thinking, persisting, and the navigation.

_Common question_: What if a step wants to cancel/skip/drop out? Then it should submit something like `{ action: skip }`.

**If you're curious why:**

1. When steps make navigational decisions, the finite-state machine is thrown out of the window. The dependency graph explodes and things get out of control quickly. Especially if you consider that steps are reusable across flows.
2. Same thing happens when steps communicate. Plus, when steps communicate, it means the flow is blind to some decisions, and the steps are less re-usable now.
3. When a step has side effects in Flow A, they may effect the step's behaviour of Flow B. Only the flow should persist things.

In general, the smarter the step, the more problematic and tailored it is. Please treat your steps as buttons or inputs.

The most important principle of Stepper is that steps should not interact with each other. Rather, they should only interact with the flow.

### Making a flow

A flow is a collection of steps. Each of these steps submit some information to the flow, which means the state of the flow is largely the sum of these submitted data. For that reason, the `FlowV2` interface requires the steps collection to be defined before the flow itself. This way, the flow can shape its state around the submissions and properties of these steps.

#### Code example

```ts
// We define our steps collection upfront because it is a prerequisite of shaping the flow.
(async) function initialize( calypsoReduxStore: Store ) {
	const includeDomainsStep = await isTheMoonFull();
	const hasAnySites = userHasAnySites( calypsoReduxStore.getState() );

	if ( includeDomainsStep ) {
		return [ STEPS.DOMAINS, STEPS.PLANS, STEPS.PROCESSING ] as const;
	}

	if ( hasAnySites ) {
		return [ STEPS.PICK_SITE, STEPS.DOMAINS, STEPS.PLANS, STEPS.PROCESSING ] as const;
	}

	return [ STEPS.PLANS, STEPS.PROCESSING ] as const;
}

export const exampleFlow: FlowV2< typeof initialize > = {
	// The name of the flow is what appears in the pathname. It must be unique.
	// This flow will be under /setup/my-flow.
	/**
	 * The name of the flow is what appears in the pathname. It must be unique.
	 * This flow will be under /setup/my-flow.
	 * */
	name: 'my-flow',

	/**
	 * This flag that _MUST be `true` for signup flows_ (generally where a new site may be created), and should be `false` for other flows.
	 * It controls whether we'll trigger a `calypso_signup_start` Tracks event when the flow starts.
	 * */
	isSignupFlow: true,
	initialize,
	/**
	 * This hook is the control unit of your flow. It is where:
	 * 1. You handle and use the information submitted by the steps.
	 * 2. You decide to navigate to which steps when.
	 * 3. You manage the state of the flow.
	 * */
	useStepNavigation( currentStepSlug, navigate ) {
		// This hook should be enough to manage and persist all the state your flows needs.
		const { get, set } = useFlowState();

		// This function handles the submission event of every step in the flow.
		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case 'domains': {
					// Here we have the data submitted by the domains step.
					// `providedDependencies` will be fully-typed and should contain the exact types of the domain step submission.
					const domainItem = providedDependencies.domainItem;
					// By calling this, we're updating the state of the flow to save the picked domain.
					// This will be precisely persisted for the whole session, but not longer.
					set( 'domains', domainItem );
					// Because the flow knows the steps it contains, `navigate` will only only allow `'plans' | 'domains'` are the first argument.
					navigate( 'plans' );
					break;
				}
				case 'plans': {
					// Here we have the data submitted by the plans step.
					const planItem = providedDependencies.planItem;
					set( 'plans', planItem );

					// setPendingAction allows you to enqueue any promise.
					setPendingAction( () => createSite() );
					break;
				}
				case 'processing': {
					// The processing step will pick up the pending action we set above, run it, and await it.
					// It will show a progress bar during that time.
					// Then it will `submit` whatever your pendingAction resolves to.
					const createdSiteId = providedDependencies.sideId;
					window.location = `/checkout/${ createdSiteId }`;
					break;
				}
			}
		};

		return { submit };
	},
};
```

#### Registering the flow

Flows have to be registered [here](/client/landing/stepper/declarative-flow/registered-flows.ts).

#### File hierarchy convention

Please put your flow in a folder, not a loose file. And include a README file with cursory information about your flow.

#### Managing authentication

Stepper takes care of authenticating your users. You should not have to worry about auth at all. All you need to do, is mark the steps as gated behind auth.

```ts
function initialize() {
	// Gate all the steps
	return stepsWithRequiredLogin( [ STEPS.DOMAINS, STEPS.PLANS, STEPS.PROCESSING ] );

	// Gate some
	return [ STEPS.DOMAINS, ...stepsWithRequiredLogin( [ STEPS.PLANS, STEPS.PROCESSING ] ) ] as const;
}
```

**Stepper will take care of:**

1. Injecting the user step when the user is not logged in.
2. Sign up or log in the user.
3. Bring the user back to the right step.

#### Asserting conditions before running the flow

Say, you want your flow to only be accessible to a certain type of user. You can assert these condition in the `initialize` function.

```ts
async function initialize() {
	const hasAccessToFlow = await isAgencyUser();

	if ( ! hasAccessToFlow ) {
		window.location = '/home';
		// Return false to halt the fetching and execution of the steps. Making the redirect much faster.
		return false;
	}

	return [ STEPS.PLANS, STEPS.PROCESSING ] as const;
}
```

### Making a Step

Note: Before making a step, please make sure there isn't already a suitable step in [`steps.tsx`](/client/landing/stepper/declarative-flow/internals/steps.tsx) file. If you do make a step you'll have to add it to that file.

A step is simply a React component that:

1. Renders stuff that collects user input.
2. Submit said input to the flow.
3. May or may not accept props from the flow.

#### Code example

```tsx
/**
 * Each step must be typed as Step. And it should declare the types of the data it submits and the data it accepts.
 * */
const SelectImportedSiteSource: Step< {
	// This steps submits `platform` and `url` strings.
	submits: {
		platform: 'Wix' | 'Squarespace';
		url: string;
	};
	// And it accepts the following props.
	accepts: {
		title?: string;
		subTitle?: string;
	};
} > = function ImportStep( props ) {
	const siteSlug = useSiteSlug();
	/**
	 * `navigation` prop is provided by Stepper. It allows your step to submit.
	 * */
	const { navigation, title, subTitle } = props;

	return (
		<div>
			<h1>{ title || 'Welcome to WordPress.com' }</h1>
			<h2>{ subTitle || 'Time to migrate you a site!' }</h2>

			<form
				onSubmit={ ( event ) =>
					navigation.submit( {
						platform: event.currentTarget.platform,
						url: event.currentTarget.url,
					} )
				}
			>
				<label>
					Enter the URL of your site
					<input type="url" name="url" />
				</label>

				<label>
					Pick your current site platform
					<select name="platform">
						<option value="wix">Wix</option>
						<option value="ss">Squarespace</option>
					</select>
				</label>

				<button>Submit</button>
			</form>
		</div>
	);
};

export default SelectImportedSiteSource;
```

#### Passing data down to steps

It is often the case that you want to customize steps around your flow. You can do that via `useStepsProps`.

#### Reusability

Stepper aims to create a big `steps-repository` that contains the steps and allows them to be recycled and reused. Every step you create is inherently reusable by any future flow. Because steps are like components, they're not parts of the flows, flows just happen to use them.

This creates a couple of restrictions.

To maintain the reusability:

1. Flow-specific styling should be done in a `style.scss` file put in the flow's folder. Each step should have the basic styling necessary to operate on its own.
2. Steps should not do `if (flow === 'X') do Y`. This is a very common pattern. It was a necessary evil before we introduced `useStepsProps`. But now, it's an unnecessary evil 😬

#### Renaming Steps

There may be a time when a step needs to be renamed. In order to preserve Tracks data and funnels, we recommend adding a new entry to `getStepOldSlug` in the `FlowRenderer` component. This ensures that tracks events will fire with both the new step slug and the old step slug.

### State management

The `useFlowState` hook will allow you to store and retrieve any information for the duration of the session (defined [here](https://vertexp2.wordpress.com/2025/01/20/proposal-signup-state-management-and-persistence/#iii-the-proposal)). Sessions can live a long time. They're not limited by time.

**Note: **You'll need to set `__experimentalUseSessions` flag to `true` to be able to use this new API.

#### Typed state

There shouldn't be any state that is untyped in Stepper.

```ts
const { set } = useFlowState();
// The `useFlowState` will infer the types of `plans` from the types of the steps whose slug is `plans`. It will use the `submits:` part of the step types.
set( 'plans', data );
```

##### Miscellaneous fields

In some cases, flows will need state that is not submitted from a step. In which case, it should be specified and typed in the [manifest](client/landing/stepper/declarative-flow/internals/state-manager/stepper-state-manifest.ts).

### The API

| Field Name | Description | Notes |
|------------|-------------|-------|
| initialize | <kbd>Required</kbd> Method to define flow steps and pre-flow actions | Required method that runs once when flow is mounted. Can be asynchronous |
| name | <kbd>Required</kbd> Identifier for the flow | Required string field |
| useStepNavigation | <kbd>Required</kbd>  Hook for step navigation | Required hook for handling step navigation |
| isSignupFlow | <kbd>Required</kbd> Indicates if the flow is for signup | Required boolean flag |
| __experimentalUseBuiltinAuth | Enables built-in authentication within Stepper | Optional boolean flag. When true, the flow will login the user without leaving Stepper |
| __experimentalUseSessions | Enables session-based progress storage | Optional boolean flag. When true, the flow will use sessions to store the user's progress. **This flag is required if you use `useFlowState` hook. |
| getSteps | Method to retrieve flow steps | Optional method that returns the flow steps. **In most cases, using this function results in bad practices. Try to avoid it, unless you really have to**. |
| classnames | CSS classes for styling | Optional string or array of strings |
| useLoginParams | Hook to configure login URL | Optional hook that returns login configuration object with customLoginPath and extraQueryParams |
| useSideEffect | Hook for flow-level side effects | Optional hook called at every render in the flow's root. **You can use `useEffect` or other hooks inside this hook**. |
| useTracksEventProps | Hook for customizing Tracks event properties | Optional hook for overriding default Tracks event logging |

## Help and feedback

Please feel free to reach out to Team T-Rex for any feedback or if you need help.
```
