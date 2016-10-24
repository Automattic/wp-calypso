Image Preloader
===============

Image Preloader is a React component to display a placeholder element until the network request to retrieve the image has completed. This is particularly useful when changing the `src` attribute of an image, which can have a noticeable delay due to how React applies the minimal DOM diff. This is illustrated by the following CodePen, where progressing between images maintains the current image until the next is finished loading:

http://codepen.io/aduth/pen/doqovP?editors=001

## Usage

```jsx
var React = require( 'react' ),
	ImagePreloader = require( 'components/image-preloader' );

React.createClass( {
	render: function() {
		return (
			<ImagePreloader
				placeholder={ <div>Loading...</div> }
				src="http://lorempixel.com/200/200" />
		);
	}
} );
```

## Props

All props will be transferred to the rendered `<img />` element, with the exception of `placeholder`.

### `placeholder`

- __Type:__ React element
- __Required:__ Yes

A React element to render while the image `src` is being loaded.

### `children`

- __Type:__ React node
- __Required:__ No

If a child is passed, it will be used as substitute content in the case that the image fails to load.

### `onLoad`

- __Type:__ function
- __Required:__ No

A custom function to call when the image loading is complete.

### `onError`

- __Type:__ function
- __Required:__ No

A custom function to call if the image loading fails.
