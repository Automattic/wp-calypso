Progress Bar
==============

This component is used to display a single bar in a background color,
and another bar on top of that filled, in a different color,
with a % of the size of the background.
Once this component is mounted, it will always progress forward, never backward: if `value` property is first 20 and later 15, the bar will still reflect the last maximum value, 20.

#### How to use:

```js
import ProgressBar from 'components/progress-bar';

render() {
	return <ProgressBar
		value={ amount }
		total={ total }
		color={ color }
		title={ title }
	/>;
}
```

#### Props

* `value`: a number representing the amount over the total to be represented in the bar (required).
* `total`: a number representing the value corresponding to the 100% of the bar (optional, default == 100).
* `color`: a string of a css color (optional).
* `title`: a string for the title attribute (optional).
* `compact`: If true, displays as a compact progress bar (optional).
* `className`: You can add classes to either (optional).
* `isPulsing`: If true, will add a barber pole animation to the value part of the bar (optional).
