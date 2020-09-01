# Step Progress

`<StepProgress />` is a React component for rendering a series of steps that need to be completed and the user's progress through those steps.

This component is distinguished from `Wizard` and `WizardProgressBar` in that in renders each discrete step with a name.

## Properties

### `steps { string[] }`

A list of the display name of the steps to progress through

### `currentStep { number }`

The zero-based index of the current step

## Usage

```jsx
const steps = [ 'First Step', 'Second Phase', 'Verification' ];

<StepProgress steps={ steps } currentStep={ 0 } />;
```
