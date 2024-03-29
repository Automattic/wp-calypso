# Spinner

Spinner is a React component for rendering a loading indicator.

**Please exercise caution in deciding to use a spinner in your component.** A lone spinner is a poor user-experience and conveys little context to what the user should expect from the page. Refer to [the _Reactivity and Loading States_ guide](https://github.com/Automattic/wp-calypso/blob/HEAD/docs/reactivity.md) for more information on building fast interfaces and making the most of data already available to use.

## Usage

```jsx
import { Spinner } from '@automattic/components';

export default function MyComponent() {
	return <Spinner />;
}
```

## Props

The following props can be passed to the Spinner component:

| PROPERTY | TYPE     | REQUIRED | DEFAULT | DESCRIPTION                                     |
| -------- | -------- | -------- | ------- | ----------------------------------------------- |
| **size** | _number_ | no       | `20`    | The width and height of the spinner, in pixels. |
