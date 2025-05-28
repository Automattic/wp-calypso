<img src="https://user-images.githubusercontent.com/17054134/159939643-4a3a7893-ab38-4223-ba5d-5dfe64282f07.png" alt="Stepper logo" width="400">

# Stepper Walkthrough Framework

Stepper is a framework that allows you to make all kinds of walkthroughs. It's geared towards signup and onboarding flows, but you can use it to make any wizard.

## Table of Contents

- [How does it work](#how-does-it-work)
  - [The most important principle: Steps shouldn't make decisions or communicate](#the-most-important-principle-steps-shouldnt-make-decisions-or-communicate)
- [Making a flow](#making-a-flow)
  - [Code example](#code-example)
  - [Registering the flow](#registering-the-flow)
  - [File hierarchy convention](#file-hierarchy-convention)
  - [Managing authentication](#managing-authentication)
  - [Asserting conditions before running the flow](#asserting-conditions-before-running-the-flow)
- [Notes](#notes)
- [Deleting your flow](#deleting-your-flow)
- [Making a Step](#making-a-step)
  - [Code example](#code-example-1)
  - [Passing data down to steps](#passing-data-down-to-steps)
  - [Reusability](#reusability)
  - [Renaming steps](#renaming-steps)
- [State management](#state-management)
  - [Typed state](#typed-state)
  - [Miscellaneous fields](#miscellaneous-fields)
- [Creating a site](#creating-a-site)
- [The API](#the-api)
- [Useful utilities and hooks](#useful-utilities-and-hooks)
- [Troubleshooting](#troubleshooting)
- [Help and feedback](#help-and-feedback)

## How does it work

A Stepper flow **is not a series of steps**; it's a graph of steps with a non-deterministic order. The first step of the flow is deterministic, but the following steps are decided on the fly by the flow depending on state (user input, user status, site status, etc...).

An ideal Stepper flow is a [finite-state machine](https://en.wikipedia.org/wiki/Finite-state_machine): it has a pre-defined set of possible states, and it should only be in one of those states at any given moment.

### The most important principle: Steps shouldn't make decisions or communicate

![StepperFlow](https://github.com/user-attachments/assets/c8d5b07a-4172-4ba1-92d0-7821f0b6b9f0)

Stepper steps should be a lot like native form inputs. They may receive some properties, they may have internal state (think checkbox), and they must submit some information. That's it.

1. They should not make narrative decisions (go back, go next, exit flow, etc..)
2. They should not communicate with other steps (e.g. via query params).
3. **They should not have side effects (e.g. persisting stuff in local storage).**
4. They should not know in which flow they are being rendered, nor refer directly to any other steps.


They should **only submit** to the flow, and the flow should do all the thinking, persisting, and the navigation.

**Common question**: What if a step wants to cancel/skip/drop out? Then it should submit something like `{ action: skip }`.

<details><summary><strong>Expand if you're curious why.</strong></summary>
<p>
	<ol>
		<li>When steps make navigational decisions, the aforementioned finite-state machine is thrown out of the window. The dependency graph explodes and things get out of control quickly. Especially if you consider that steps are reusable across flows.</li>
		<li>Same thing happens when steps communicate: the flow is blind to some decisions, and the steps become less re-usable.</li>
		<li>When a step has side effects in Flow A, they might affect the step's behaviour in Flow B. Only the flow should persist things.</li>
	</ol>
</p>
</details>

In general, the smarter the step, the more problematic and tailored it is. Please treat your steps as buttons or inputs.

### Making a flow

A flow is a collection of steps. Each of these steps submit some information to the flow, which means the state of the flow is largely the sum of these submitted data. For that reason, the `FlowV2` interface requires the steps collection to be defined before the flow itself. This way, the flow can shape its state around the submissions and properties of these steps.

#### Notes
1. We have an example flow you can use as a reference [here](/client/landing/stepper/declarative-flow/flows/00-example-flow/example.ts).
2. Please make sure that your flow has a unique slug.
3. Avoid inheriting flows by doing `const flow = { ...oldFlow, someChanges: ... }`, unless you own both flows and able to ensure changing the old flow won't break the new flow.



#### Code example

```ts
import { useFlowState } from '../../internals/state-manager/store';
import { STEPS } from '../../internals/steps';

// We define our steps collection upfront because it is a prerequisite of shaping the flow.
async function initialize( calypsoReduxStore: Store ) {
	const includeDomainsStep = await isTheMoonFull();
	const hasAnySites = userHasAnySites( calypsoReduxStore.getState() );

	if ( includeDomainsStep ) {
		return [ STEPS.UNIFIED_DOMAINS, STEPS.UNIFIED_PLANS, STEPS.PROCESSING, STEPS.ERROR ] as const;
	}

	if ( hasAnySites ) {
		return [ STEPS.PICK_SITE, STEPS.UNIFIED_DOMAINS, STEPS.UNIFIED_PLANS, STEPS.PROCESSING, STEPS.ERROR ] as const;
	}

	// We need `as const` to promise TS that these steps won't change later.
	return [ STEPS.UNIFIED_PLANS, STEPS.PROCESSING, STEPS.ERROR ] as const;
}

export const exampleFlow: FlowV2< typeof initialize > = {
	/**
	 * The name of the flow is what appears in the pathname. It must be unique.
	 * This flow will be under /setup/my-flow.
	 */
	name: 'my-flow',

	/**
	 * This flag must be `true` for signup flows (generally where a new site may be created), and should be `false` for other flows.
	 * It controls whether we'll trigger a `calypso_signup_start` Tracks event when the flow starts.
	 */
	isSignupFlow: true,
	initialize,
	/**
	 * This hook is the control unit of your flow. It is where:
	 * 1. You handle and use the information submitted by the steps.
	 * 2. You decide to navigate to which steps when.
	 * 3. You manage the state of the flow.
	 */
	useStepNavigation( currentStepSlug, navigate ) {
		// This hook should be enough to manage and persist all the state your flows needs.
		const { get, set } = useFlowState();

		// This function handles the submission event of every step in the flow.
		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case 'domains': {
					// Here we have the data submitted by the domains step.
					// By calling this, we're updating the state of the flow to save the picked domain.
					// This will be persisted for the duration of the session only.
					set( 'domains', providedDependencies );
					// Because the flow knows the steps it contains, `navigate` will only allow `'plans' | 'domains' | 'processing'` as the first argument.
					navigate( 'plans' );
					break;
				}
				case 'plans': {
					// Here we have the data submitted by the plans step.
					set( 'plans', providedDependencies );

					// setPendingAction allows you to enqueue any promise.
					setPendingAction( () => createSite() );
					navigate( 'processing' );
					break;
				}
				case 'processing': {
					// The processing step is a special step:
					// 1. It will pick up the pending action we set above, run it, and await it. It will show a progress bar during that time. Then it will `submit` whatever your pendingAction resolves to. In this example, that would be a site object.
					// 2. If your promise rejects (throws), it will store the error in the store. Then, you can redirect to the `error` step and it will render that error nicely.
					if ( providedDependencies.processingResult === ProcessingResult.Success ) {
						if ( providedDependencies.goToCheckout ) {
							const createdSiteId = providedDependencies.siteId;
							window.location = `/checkout/${ createdSiteId }`;
						} else {
							window.location = `/home/${ createdSiteId }`;							
						}
						break;
					} else {
						// an error has occurred. 
						navigate( 'error' );
					}
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

[Please put your flow in a folder](https://dotcom.wordpress.com/2025/03/14/stepper-move-flows-into-their-own-folder/), not as a standalone file. And include a README file with cursory information about your flow **and testing steps**. Then simply link to them in your PRs (win-win).

#### Managing authentication

Stepper takes care of authenticating your users. You should not have to worry about auth at all. All you need to do is mark the steps as gated behind auth.

```ts
function initialize() {
	// Gate all the steps
	return stepsWithRequiredLogin( [ STEPS.UNIFIED_DOMAINS, STEPS.UNIFIED_PLANS, STEPS.PROCESSING ] );

	// Gate some
	return [ STEPS.UNIFIED_DOMAINS, ...stepsWithRequiredLogin( [ STEPS.UNIFIED_PLANS, STEPS.PROCESSING ] ) ] as const;
}
```

**Stepper will take care of:**

1. Injecting the user step when the user is not logged in.
2. Sign up or log in the user.
3. Bring the user back to the right step.

#### Asserting conditions before running the flow

If you want your flow to only be accessible to a certain type of user, you can assert the conditions in the `initialize` function.

```ts
async function initialize() {
	const hasAccessToFlow = await isAgencyUser();

	if ( ! hasAccessToFlow ) {
		window.location = '/home';
		// Return false to halt the fetching and execution of the steps. This makes the redirect much faster.
		return false;
	}

	return [ STEPS.UNIFIED_PLANS, STEPS.PROCESSING ] as const;
}
```

#### Pending actions

### Notes

1. A successful flow is a rare event, so most flows are sadly ephemeral. Please keep as much logic, CSS, and code as possible into the flow folder itself. So that when it's deleted, clean up is easy.
2. Adding testing steps in your flow's README goes a long way. It's essential to add basic ones to smoke test your flow.
3. Adding tests for flow is immensely helpful in keeping Stepper solid. Because it makes improving the framework safer and thus more likely to happen.
4. Feel free to ask for help any time. You can post in `#dotcom-stepper` or ping `@alshakero`.
5. Please try to avoid modifying the framework's code around your flow. It should be the very last resort.

### Deleting your flow

After deleting your flow, please setup a redirect for it [here](/client/landing/stepper/utils/flow-redirect-handler.ts). It redirects users who land on it to a happy path.

### Making a Step

**Note**: Before making a step, please make sure there isn't already a suitable step in [`steps.tsx`](/client/landing/stepper/declarative-flow/internals/steps.tsx). If you do make a step you'll have to register it in that file.

Steps should live in `client/landing/stepper/declarative-flow/internals/steps-repository`.

**Note**: Please make sure that your step has a unique slug.

**A step is simply a React component that**:

1. Renders UI that collects user input.
2. Submit said input to the flow.
3. May or may not accept props from the flow.

#### Code example

```tsx
/**
 * Each step must be typed as Step. And it should declare the types of the data it submits and the data it accepts.
 */
const SelectImportedSiteSource: Step< {
	// This steps submits `platform` and `url` strings.
	submits: {
		platform: 'WordPress' | 'Pressable';
		url: string;
	};
	// And it accepts the following props. Adding them here will make them available in the `props` object.
	accepts: {
		title?: string;
		subTitle?: string;
	};
} > = function ImportStep( props ) {
	const siteSlug = useSiteSlug();
	/**
	 * `navigation` prop is provided by Stepper. It allows your step to submit.
	 */
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

Stepper aims to create a big `steps-repository` that contains the steps and allows them to be recycled and reused. Every step you create is inherently reusable by any future flow. Because steps are like components, they're not parts of a flow, flows just happen to use them.

**This creates a couple of restrictions.**

1. Flow-specific styling should be done in a `style.scss` file put in the flow's folder. Each step should have the basic styling necessary to operate on its own.
2. Steps should not do `if ( flow === 'X' ) do Y`. This is a very common pattern. It was a necessary evil before we introduced `useStepsProps`. But now, it's an unnecessary evil 😬

#### Renaming steps

There may be a time when a step needs to be renamed. In order to preserve Tracks data and funnels, we recommend adding a new entry to [`getStepOldSlug`](client/landing/stepper/declarative-flow/helpers/get-step-old-slug.ts) mapping. This ensures that tracks events will fire with both the new step slug and the old step slug.

### State management

The `useFlowState` hook will allow you to store and retrieve any information for the duration of the session (defined [here](/client/landing/stepper/docs/sessions.md)). Sessions can live a long time. They're not limited by time.

**Note:** You'll need to set `__experimentalUseSessions` flag to `true` to be able to use this new API.

#### Typed state

There shouldn't be any state that is untyped in Stepper.

```ts
const flow = {
	useStepNavigation() {
		const { set } = useFlowState();
		// The `useFlowState` will infer the types of `plans` from the types of the steps whose slug is `plans`. It will use the `submits:` part of the step types.
		set( 'plans', data );
	},
};
```

### Creating a site

It's quite common that you'd want to create a site by the end of your flow. To do that, Stepper offers `useCreateSite` hook. This hook collects the state you set in `useFlowState` and some arguments and makes a site for you.

Please check the [example flow](/client/landing/stepper/declarative-flow/flows/00-example-flow/example.ts) to see how that works.

#### Miscellaneous fields

In some cases, flows will need state that is not submitted from a step. In which case, it should be specified and typed in the [manifest](/client/landing/stepper/declarative-flow/internals/state-manager/stepper-state-manifest.ts).

## The API

| Field Name                     | Description                                                          | Notes                                                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialize`                   | <kbd>Required</kbd> Method to define flow steps and pre-flow actions | Required method that runs once when flow is mounted. Can be asynchronous                                                                                  |
| `name`                         | <kbd>Required</kbd> Identifier for the flow                          | Required string field                                                                                                                                     |
| `useStepNavigation`            | <kbd>Required</kbd> Hook for step navigation                         | Required hook for handling step navigation                                                                                                                |
| `isSignupFlow`                 | <kbd>Required</kbd> Indicates if the flow is for signup              | Required boolean flag                                                                                                                                     |
| `__experimentalUseBuiltinAuth` | Enables built-in authentication within Stepper                       | Optional boolean flag. When true, the flow will login the user without leaving Stepper                                                                    |
| `__experimentalUseSessions`    | Enables session-based progress storage                               | Optional boolean flag. When true, the flow will use sessions to store the user's progress. **This flag is required if you use `useFlowState` hook.**      |
| `getSteps`                     | Method to retrieve flow steps                                        | Optional method that returns the flow steps. **In most cases, using this function results in bad practices. Try to avoid it, unless you really have to**. |
| `classnames`                   | CSS classes for styling                                              | Optional string or array of strings                                                                                                                       |
| `useLoginParams`               | Hook to configure login URL                                          | Optional hook that returns login configuration object with customLoginPath and extraQueryParams                                                           |
| `useSideEffect`                | Hook for flow-level side effects                                     | Optional hook called at every render in the flow's root. **You can use `useEffect` or other hooks inside this hook**.                                     |
| `useTracksEventProps`          | Hook for customizing Tracks event properties                         | Optional hook for overriding default Tracks event logging                                                                                                 |

## Useful utilities and hooks

Please check out the [hooks](/client/landing/stepper/hooks) and [utils](/client/landing/stepper/utils) folders. They have many useful utilities that make building flows easier.

## Troubleshooting

### TypeScript is complaining about the type of `useStepProps`

The `useStepProps` hooks allows you to pass props to your steps. TS will only allow your return value to match the steps that exist in your flow and their props. And the return value does not match, it will complain about the whole function, not a single slug or a prop. To debug, it's best to remove the props of all the steps and add them one by one until it becomes red again.

```ts
const flow = {
	//👇 the TS red line will be here 
	useStepsProps() {
		return {
			domains: {
				allowFree: true,
			},
			//👇 not here
			nonExistentStep: {				
				title: 'this step does not exist',
			},
		};
	},
};
```

### TypeScript is complaining about the arguments I'm passing to `submit`

Sometimes, in your step, you call `submit({ answer: 'yes' })` and TS will complain about the argument. This means you haven't typed your step correctly.

In this example, the step's type should look like so

```ts
const YourStep: Step< {
	submits: {
		answer: 'yes' | 'no';
	};
} >;
```

## Help and feedback

Please feel free to reach out to Team T-Rex, or post in `#dotcom-stepper` for any feedback or if you need help.
