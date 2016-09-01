SpinnerButton
===========

`<SpinnerButton />` is a React component for rendering a button with an attached loading indicator.

## Usage

```jsx
import SpinnerButton from 'components/spinner-button';

export default function MyComponent() {
	return <SpinnerButton />;
}
```

## Props

The following props can be passed to the `<SpinnerButton />` component (any other
props will be passed to the button):

### `loading`

A boolean indicating whether to show that the task is in progress.
When `true`, the spinner will be displayed, the button will be disabled,
and the button text will be switched to the content of `loadingText`.

### `text`

The text to display on the button.

### `loadingText`

The text to display on the button when `loading` is `true`.

### `size`

The size of the spinner. Defaults to 24.
