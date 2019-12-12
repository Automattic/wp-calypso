Spinner
=======

Spinner is a React component for rendering a loading indicator.

__Please exercise caution in deciding to use a spinner in your component.__ A lone spinner is a poor user-experience and conveys little context to what the user should expect from the page. Refer to [the _Reactivity and Loading States_ guide](https://github.com/Automattic/wp-calypso/blob/master/docs/reactivity.md) for more information on building fast interfaces and making the most of data already available to use.

## Usage

```jsx
import React from 'react';
import Spinner from 'components/spinner';

export default class extends React.Component {
	render() {
		return <Spinner />;
	}
}
```

## Props

The following props can be passed to the Spinner component:

| PROPERTY     | TYPE     | REQUIRED | DEFAULT | DESCRIPTION |
| ------------ | -------- | -------- | ------- | ----------- |
| **size**     | *number* | no       | `20`    | The width and height of the spinner, in pixels. |
