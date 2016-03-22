Progress Bar
==============

This component is used to display a single bar in a background color,
and another bar on top of that filled, in a different color,
with a % of the size of the background.

#### How to use:

```js
var ProgressBar = require( 'components/progress-bar' );

render: function() {
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
