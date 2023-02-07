# Launchpad: Circular Progress Bar

This component is used to display a circular progress bar as part of the cohesive Launchpad Experience and is only meant to be used in the context of Launchpad.
See <https://cylonp2.wordpress.com/2022/12/14/a-cohesive-launchpad-experience>
It displays a gray circle and another blue circle on top of it showing the progress.
It renders text in the center in the center: X/Y where X is the current step and Y is the total number of steps
The currentStep and numberOfSteps props are used to calculate represent the current progress as a fraction

## How to use

```js
import { CircularProgressBar } from '@automattic/components';

function render() {
	<CircularProgressBar currentStep={ currentTask } numberOfSteps={ numberOfTasks } />;
}
```

## Props

- `currentStep`: a number representing the current completed step (required).
- `numberOfSteps`: a number representing the total number of steps (required).
- `size`: a number representing the base size of component in pixels (required).
- `enableDesktopScaling`: a boolean that applys the 'desktop-scaling' class which scales the component size by 1.2x (optional)
