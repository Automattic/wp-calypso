Sparkline
=====

This component renders a simple sparkline, using D3 microlibraries, as an SVG path representing an array of values. For the moment, it is in the `client/extensions/woocommerce/components` path.

## Usage

```jsx

// import the component
import Sparkline from '../../components/sparkline'; //

// And use it inline inside the render method of another component
render: function() {
	return(
		<Sparkline
			data={ [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 2, 4, 6, 8, 1, 9, 3, 7, 5 ] }
		/>
	);
}

```

## Required Props

* <strong>data</strong> — An array of numbers where the array index represents the horizontal plane and each value the corresponding vertical plane.

## Optional Props
* <strong>aspectRatio</strong> — _default: 4.5_ The ratio used to calculate the relative height of the chart where `height = width / aspectRatio`.
* <strong>className</strong> — Custom class property used with `sparkline` in the component's containing `<div />`.
* <strong>highlightIndex</strong> - An integer used to highlight a value with a circle on the sparkline.
* <strong>highlightRadius</strong> - _default: 3.5_ The size of the radius of the circle used to highlight a specific data point.
* <strong>margin</strong> - _default: { top: 4, right: 4, bottom: 4, left: 4 }_ Used to pad the sparkline inside of the `svg` element so that the highlighted circle ^^ isn't cropped.

## Responsiveness

The sparkline will fill the width of any parent element and will adjust to responsive changes in that parent element's width.

The width of the sparkline's container `<div />` can be overridden by passing a custom class property in `className`. For example:

```css
.something__fifty-per {
	&.sparkline {
		width: 50%;
	}
}
```

```jsx
<Sparkline
	className="something__fifty-per"
	data={ [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 2, 4, 6, 8, 1, 9, 3, 7, 5 ] }
/>
```
