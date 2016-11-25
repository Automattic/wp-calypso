Clipboard Button
================

Clipboard Button is a React component to facilitate creating a "click-to-copy" button. Under the hood, the component uses [Clipboard.js](https://github.com/zenorocha/clipboard.js), which is a more recent library leveraging newer browser features enabling access to the user's clipboard. Browser support is [fairly good](https://github.com/zenorocha/clipboard.js#browser-support), with Safari being the notable exception. In browsers where clipboard access is not granted, the user will be presented with a prompt window after pressing the button, from which they can copy the text via system copy.

## Usage

```jsx
var React = require( 'react' ),
	ClipboardButton = require( 'components/forms/clipboard-button' );

React.createClass( {
	render: function() {
		return (
			<ClipboardButton text="Text to copy">
				Button Text
			</ClipboardButton>
		);
	}
} );
```

## Props

Below is a list of supported props. With the exception of `className`, any other props passed will be transferred to the rendered `<FormButton />` component.

| prop   | type     | required | default     | comment |
| ------ | :------: | :------: | ----------- | ------- |
| text   | string   | No       | undefined   | The text to copy to the user's clipboard upon clicking the button |
| opCopy | function | No       | lodash/noop | Function to invoke after the text has been copied to the user's clipboard. This will not be triggered if the prompt is show in place of a direct clipboard copy, in cases where the browser does no grant clipboard access |
