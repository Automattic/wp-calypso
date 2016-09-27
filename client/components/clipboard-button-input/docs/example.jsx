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
			<div>
				<ClipboardButtonInput value="https://example.wordpress.com/" />
			</div>
		);
	}
} );
