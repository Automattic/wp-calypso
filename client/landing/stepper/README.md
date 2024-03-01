<img src="https://user-images.githubusercontent.com/17054134/159939643-4a3a7893-ab38-4223-ba5d-5dfe64282f07.png" alt="Stepper logo" width="400">

# Stepper Signup and Onboarding Framework

The stepper framework is a new framework for quickly spinning up sign-up flows. This is a non-linear solution that doesn't sacrifice agility ✨.

## Non-linearity

It has been tricky for us to create flows with input-driven steps configuration. Stepper makes it easy by allowing flows to create their own two hooks `useSteps`, and `useStepNavigation`. These hooks have access to the state of the flow so they can make decisions based on that.

### Example flow

```ts
import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const exampleFlow: Flow = {
	useSteps(): Array< StepPath > {
		return [ 'domain', 'design' ];
	},
	useStepNavigation( currentStep, navigate ) {
		const goBack = () => {
			if ( currentStep === 'domain' ) {
				navigate( 'design' );
			} else {
				navigate( 'domain' );
			}
		};
		const goNext = goBack;
		return { goNext, goBack };
	},
};
```

## The API

To create a flow, you only have to implement `useSteps` and `useStepNavigation`. `useSteps` just returns an array of step keys, `useStepNavigation` is the engine where you make navigation decisions. This hook returns an object of type [`NavigationControls`](./declarative-flow/internals/types.ts):

There is also an optional `useSideEffect` hook. You can implement this hook to run any side-effects to the flow. You can prefetch information, send track events when something changes, etc...

There is a required `isSignupFlow` flag that _MUST be `true` for signup flows_ (generally where a new site may be created), and should be `false` for other flows. The `isSignupFlow` flag controls whether we'll trigger a `calypso_signup_start` Tracks event when the flow starts. For signup flows, you can also supply additional event props to the `calypso_signup_start` event by implementing the optional `useSignupStartEventProps()` hook on the flow.

```tsx
// prettier-ignore
/**
 * This is the return type of useStepNavigation hook
 */
export type NavigationControls = {
	/**
	 * Call this function if you want to go to the previous step.
	 */
	goBack: () => void;
	/**
	 * Call this function if you want to go to the proceed down the flow.
	 */
	goNext: () => void;
	/**
	 * Call this function if you want to jump to a certain step.
	 */
	goToStep?: ( step: StepPath ) => void;
	/**
	 * Submits the answers provided in the flow
	 */
	submit?: ( providedDependencies?: ProvidedDependencies, ...params: string[] ) => void;
};
```

Since this is a hook, it can access any state from any store, so you can make dynamic navigation decisions based on the state. [Here](./declarative-flow/site-setup-flow.ts) is a developed example of this hook.

```ts
import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const exampleFlow: Flow = {
	useSteps(): Array< StepPath > {
		return [];
	},
	useStepNavigation( currentStep, navigate ) {
		return { goNext, goBack };
	},
};
```

### Assert Conditions

Optionally, you could also define a `useAssertConditions` function in the flow. This function can be used to add some conditions to check, and maybe return an error if those are not met.

```ts
import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const exampleFlow: Flow = {
	useSteps(): Array< StepPath > {
		return [];
	},
	useStepNavigation( currentStep, navigate ) {
		return { goNext, goBack };
	},
	useAssertConditions() {
		const siteSlug = useSiteSlugParam();

		if ( ! siteSlug ) {
			throw new Error( 'site-setup did not provide the site slug it is configured to.' );
		}
	},
};
```

## Reusability

Stepper aims to create a big `steps-repository` that contains the steps and allows them to be recycled and reused. Every step you create is inherently reusable by any future flow. Because steps are like components, they're not parts of the flows, flows just happen to use them.

This creates a couple of restrictions.

To maintain the reusability and simplicity of this framework it is important that flow-specific styling changes be made to a `flow` stylesheet or in `global.scss`. Each step should have the basic styling necessary to operate on its own just like a package.

And each step should only get flow-level state from a store (not props).

## Renaming Steps

There may be a time when a step needs to be renamed. In order to preserve Tracks data and funnels, we recommend adding a new entry to `getStepOldSlug` in the `FlowRenderer` component. This ensures that tracks events will fire with both the new step slug and the old step slug.

## State management

Steps shouldn't have any props other than the `navigation` prop which contains the return value of `useStepNavigation`. This object (`navigation`) allows the step to `submit` when done or to move to other steps or to `goNext`, `goBack`, etc..

The rationale behind this is the following:

1. **Small API**: when steps have such small API surface area, they can be reused easily.
2. **Centralized state**: the `useStepNavigation` hook makes decisions based on the entire flow's state, so the state has to be centralized, i.e: lives entirely in the `onboard` store (or any store inside `packages/data-stores`).

All the state should be either in the onboarding store or the internal state of the step. This creates a flat data tree that is exactly one level deep and allows steps to be easily created and re-used.

It takes five minutes to add a new field to the `onboard` store. Such as [`intent`](../../../packages/data-stores/src/onboard/reducer.ts) or [`storeType`](../../../packages/data-stores/src/onboard/reducer.ts).

## Preferring packages

When creating new code, it's highly-encouraged to put it into packages, whether existing like `onboarding` or new packages that you create. This allows us to create flows in the future that live in wp-admin or wherever.

## Help and feedback

Please feel free to reach out to Team Vertex for any feedback or if you need help.
