# Chart

This module renders a dataset as an HTML-based chart representing the data.

## Usage

```jsx
// import the component
import ElementChart from 'calypso/my-sites/chart';

// And use it inline inside the render method of another component
function render() {
	return (
		<ElementChart
			loading={ loading /*boolean*/ }
			data={ data /*array*/ }
			barClick={ barClick /*function*/ }
		/>
	);
}

// Example Data Array
/*
[ {
	'label': 		<String>, // x-axis label
	'value': 		<Number>, // bar value
	'nestedValue':	<Number>, // nested bar value or null if no nested bar
	'className': 	<String>, // classname(s) applied to bar container
	'data':			<Object>, // any data that you want to have access to in the barClick callback
	'tooltipData':	[
		{
			label: 		<String>,
			value: 		<Number>,
			link: 		<String>,
			icon: 		<String>,
			className: 	<String>
		}
	]
} ]
*/
```

## Required Props

- <strong>loading</strong> — Any truthy value indicates the chart is loading
- <strong>data</strong> — An array of data objects using the format outlined above

## Optional Props

- <strong>minTouchBarWidth</strong> — _default: 42_ The minimum bar width on touch devices
- <strong>minBarWidth</strong> — _default: 15_ The minimum bar width on non-touch devices
- <strong>barClick</strong> - The function to be called when a bar is clicked on the chart, it is passed the entire data object of the bar
