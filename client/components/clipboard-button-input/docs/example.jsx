/**
 * External dependencies
 */
import React from 'react/addons';

/**
 * Internal dependencies
 */
import ClipboardButtonInput from '../';

export default React.createClass( {
	displayName: 'ClipboardButtonInput',

	mixins: [ React.addons.PureRenderMixin ],

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/clipboard-button-input">Clipboard Button Input</a>
				</h2>
				<ClipboardButtonInput value="https://example.wordpress.com/" />
			</div>
		);
	}
} );
