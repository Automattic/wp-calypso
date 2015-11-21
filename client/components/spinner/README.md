Spinner
=======

Spinner is a React component for rendering a loading indicator.

<img src="https://cldup.com/H27NKdxFBN.gif" alt="Demo" />

__Please exercise caution in deciding to use a spinner in your component.__ A lone spinner is a poor user-experience and conveys little context to what the user should expect from the page. Refer to [the _Reactivity and Loading States_ guide](https://github.com/Automattic/wp-calypso/blob/master/docs/reactivity.md) for more information on building fast interfaces and making the most of data already available to use.

## Usage

```jsx
var React = require( 'react' ),
	Spinner = require( 'components/spinner' );

React.createClass( {
	render: function() {
		return <Spinner />;
	}
} );
```

## Props

The following props can be passed to the Spinner component:

### `size`

<table>
	<tr><td>Type</td><td>Number</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td>20</td></tr>
</table>

The width and height of the spinner, in pixels.

### `duration`

<table>
	<tr><td>Type</td><td>Number</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td>3000</td></tr>
</table>

The duration of a single spin animation, in milliseconds.
