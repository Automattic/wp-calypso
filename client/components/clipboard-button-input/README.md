Clipboard Button Input
======================

Clipboard Button Input is a React component used to display a text input field containing a button for copying the value of the input to a user's clipboard. It makes use of the [Clipboard Button component](../forms/clipboard-button), which leverages [Clipboard.js](https://github.com/zenorocha/clipboard.js) for non-Flash based copy behavior.

## Usage

In most cases, the component can be treated much like any other text input element. Pass a `value` to be used as the input text to be copied.

```jsx
import React from 'react';
import ClipboardButtonInput from 'components/clipboard-button-input';

export default function MyComponent() {
	return (
		<ClipboardButtonInput value="https://example.wordpress.com/" />
	);
};
```

## Props

The following props can be passed to the ClipboardButtonInput component. With the exception of `className`, all props, including those not listed below, will be passed to the child `<input />` element.

| prop     | type    | required | default | comment |
| -------- | ------- | :------: | ------- | ------- |
| value    | string  | No       | ""      | The value of the `<input />` element, and the text to be copied when clicking the button |
| disabled | boolean | No       | false   | Whether the children `<input />` and `<button />` should be rendered as `disabled` | 
