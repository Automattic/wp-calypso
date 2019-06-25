TextControl
==============

This component is used to let users enter and edit text. It is best used for free text entry.
Because TextControls are single-line fields, they are not suitable for collecting long responses. For those, use a text area instead.

#### How to use:

```js
import { TextControl } from '@automattic/calypso-ui';

export default class extends PureComponent {
	static displayName = 'TextControl';

	state = {
		inputTextValue1: 'Input value',
	};

	render() {
		const { inputTextValue } = this.state;
		return (
			<div>
				<TextControl
					label={ 'Text input with value' }
					value={ inputTextValue }
					onChange={ value => this.setState( { inputTextValue: value } ) }
				/>
			</div>
		);
	}
}

```

#### Props

https://developer.wordpress.org/block-editor/components/text-control/#props