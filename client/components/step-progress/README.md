# Step Progress

`<StepProgress />` is a React component for rendering a series of steps that need to be completed and the user's progress through those steps.

This component is distinguished from `Wizard` and `WizardProgressBar` in that in renders each discrete step with a name.

## Properties

### `steps { string | { message: string, onClick: () => void, indicator: <Icon icon={check} />, show: 'always' }[] }`

A list of the display name of the steps to progress through. Optionally an object with a click handler

### `currentStep { number }`

The zero-based index of the current step

## Usage

```jsx
const steps = [ 'First Step', 'Second Phase', 'Verification' ];

<StepProgress steps={ steps } currentStep={ 0 } />;
```
