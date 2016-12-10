import React from 'react';

import Dialog from 'components/dialog';

export const InstagramShortcodeWizard = React.createClass( {
	insertShortcode( closeDialog ) {
		const {
			onUpdateContent
		} = this.props;

		const shortcode = `[instagram url=${ this.urlInput.value } width=${ this.widthInput.value } /]`;

		onUpdateContent( shortcode );

		closeDialog();
	},

	render() {
		const buttons = [
			{ action: 'insert', label: 'Insert', onClick: this.insertShortcode },
			{ action: 'cancel', label: 'Cancel', onClick: close => close() }
		];

		return (
			<Dialog isVisible={ true } buttons={ buttons } onClose={ this.props.onClose }>
				<h1>Add an Instagram link!</h1>
				<p>URL: <input ref={ r => ( this.urlInput = r ) } type="text" /></p>
				<p>Width: <input ref={ r => ( this.widthInput = r ) } type="text" /></p>
			</Dialog>
		);
	}
} );

InstagramShortcodeWizard.displayName = 'InstagramShortcodeWizard';

export default InstagramShortcodeWizard;
