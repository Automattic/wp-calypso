# Clipboard Button

Clipboard Button is a React component to facilitate creating a "click-to-copy" button. Under the hood, the component uses [Clipboard.js](https://github.com/zenorocha/clipboard.js), which is a more recent library leveraging newer browser features enabling access to the user's clipboard. Browser support is [fairly good](https://github.com/zenorocha/clipboard.js#browser-support), with Safari being the notable exception. In browsers where clipboard access is not granted, the user will be presented with a prompt window after pressing the button, from which they can copy the text via system copy.

## Usage

```jsx
import React, { Component } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';

const MyComponent = () => <ClipboardButton text="Text to copy">Button Text</ClipboardButton>;
```

## Props

Below is a list of supported props. With the exception of `className`, any other props passed will be transferred to the rendered `<FormButton />` component.

### `text`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>undefined</code></td></tr>
</table>

The text to copy to the user's clipboard upon clicking the button.

### `onCopy`

<table>
	<tr><td>Type</td><td>Function</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>lodash/noop</code></td></tr>
</table>

Function to invoke after the text has been copied to the user's clipboard. This will not be triggered if the a prompt is shown in place of direct clipboard copy, in cases where the browser does not grant clipboard access.
