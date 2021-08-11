import React from 'react';
import ClipboardButtonInput from '../';

export default class extends React.PureComponent {
	static displayName = 'ClipboardButtonInput';

	render() {
		return (
			<div>
				<ClipboardButtonInput value="https://example.wordpress.com/" />
			</div>
		);
	}
}
