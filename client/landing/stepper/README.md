<img src="https://user-images.githubusercontent.com/17054134/159939643-4a3a7893-ab38-4223-ba5d-5dfe64282f07.png" alt="Stepper logo" width="400">

# Stepper Signup and Onboarding Framework
The stepper framework is a new framework for quickly spinning up sign up flows. It's meant to make non-linearly easy without sacrificing agility ✨. 

## Non-linearity
It has been tricky for us to create flows that input-driven steps. Stepper makes it easy by allowing flows to create their own two hooks `useSteps`, and `useStepNavigation`. These hooks have access to the state of of the flow so they can make decisions based on that.

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
		return { goNext, goBack, goToStep };
	},
};
```

## The API

To create a flow, you only have to define `useSteps` and `useStepNavigation`. `useSteps` just returns an array of step keys, `useStepNavigation` is the engine where you make navigation decisions. This hook returns an object of type [`NavigationControls`](./declarative-flow/internals/types.ts):

```ts
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

## Reusability
Stepper aims to create a big `steps-repository` that contains the steps and allows them to be recycled and reused. Every step you create is inherently reusable by any future flow. Because steps are like components, they're not parts of the flows, flows just happen to use them.

This creates a couple of restrictions.

## State management
Steps shouldn't have any props other than `navigation` prop which contains the return value of `useStepNavigation`. This object (`navigation`) allows the step to `submit` when done or to move to other steps or to `goNext`, `goBack`, etc..

The rationale behind this is the following:

1. **Small API**: when steps have such little API surface area. They can be reused easily.
2. **Centralized state**: the `useStepNavigation` hook makes decisions based on the entire flow's state, so the state has to be centralized, i.e: lives entirely in the `onboard` store (or any store inside `packages/data-stores`).

All the state should be either the onboarding store, or in the internal state of the step. This creates a flat data tree that is exactly one level deep. This allows the steps to be easy to make and to reuse without any added effort.

It takes five minutes to add a new field to the onboarding store. Such as `intent` or `storeType`. 

## Preferring packages
When creating new code, it's highly-encouraged to put it packages, whether existing like `onboarding` or new packages that you create. This allows us to create flows in the future that live in wp-admin or wherever.

## Help and feedback
Please feel free to reach out to Team Vertex for any feedback or if you need help.



