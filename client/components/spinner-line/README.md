# SpinnerLine

`<SpinnerLine />` is a React component for rendering a horizontal rule loading indicator. Contrasted with `<Spinner />`, this component can be used in indicating that a section is pending vertical expansion.

<img src="https://cldup.com/cYmgv_L6r3.gif" alt="Demo" />

**Please exercise caution in deciding to use a spinner in your component.** A lone spinner is a poor user-experience and conveys little context to what the user should expect from the page. Refer to [the _Reactivity and Loading States_ guide](https://github.com/Automattic/wp-calypso/blob/HEAD/docs/reactivity.md) for more information on building fast interfaces and making the most of data already available to use.

## Usage

```jsx
import SpinnerLine from 'calypso/components/spinner-line';

export default function MyComponent() {
	return <SpinnerLine />;
}
```

## Props

The following props can be passed to the `<SpinnerLine />` component:

| property    | type   | required | default | comment                                                                                              |
| ----------- | ------ | -------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `className` | String | no       | `null`  | A custom class name to apply to the rendered element, in addition to the base `.spinner-line` class. |
