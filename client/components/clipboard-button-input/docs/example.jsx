/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import ClipboardButtonInput from '../';
import DocsExample from 'components/docs-example';

export default React.createClass( {
	displayName: 'ClipboardButtonInput',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Clipboard Button Input"
				url="/devdocs/design/clipboard-button-input"
				componentUsageStats={ this.props.getUsageStats( ClipboardButtonInput ) }
			>
				<ClipboardButtonInput value="https://example.wordpress.com/" />
			</DocsExample>
		);
	}
} );
