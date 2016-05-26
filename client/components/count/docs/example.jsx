/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Count from 'components/count';
import DocsExample from 'components/docs-example';

module.exports = React.createClass( {
	displayName: 'Count',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Count"
				url="/devdocs/design/count"
				componentUsageStats={ this.props.getUsageStats( Count ) }
			>
				<Count count={ 65365 } />
			</DocsExample>
		);
	}
} );
