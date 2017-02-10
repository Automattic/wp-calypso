Spinner
=======

Spinner is a React component for rendering a loading indicator.

![Spinner Demo](https://cldup.com/H27NKdxFBN.gif)

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

| prop name | type   | required | default | comment |
| --------- | ------ | :------: | ------: | ------- |
| size      | Number | No       | 20      | The width and height, in pixels |
| duration  | Number | No       | 3000    | The duration of a single revolution, in milliseconds |

