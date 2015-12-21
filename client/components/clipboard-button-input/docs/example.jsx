/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import ClipboardButtonInput from '../';

export default React.createClass( {
	displayName: 'ClipboardButtonInput',

	mixins: [ PureRenderMixin ],

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
