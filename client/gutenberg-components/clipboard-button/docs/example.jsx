/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { ClipboardButton } from '@wordpress/components';

ClipboardButton.displayName = 'ClipboardButton';

export default class extends React.Component {
	static displayName = 'ClipboardButton';

	state = {
		hasCopied: false,
	};

	render() {
		return (
			<ClipboardButton
				isPrimary
				text="WordPress"
				onCopy={ () => this.setState( { hasCopied: true } ) }
				onFinishCopy={ () => this.setState( { hasCopied: false } ) }
			>
				{ this.state.hasCopied ? 'Copied!' : 'Copy Text' }
			</ClipboardButton>
		);
	}
}
