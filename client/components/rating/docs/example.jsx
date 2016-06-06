/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
import Rating from 'components/rating';

module.exports = React.createClass( {
	displayName: 'Rating',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Rating"
				url="/devdocs/design/rating"
				componentUsageStats={ this.props.getUsageStats( Rating ) }
			>
				<Rating rating={ 65 } size={ 50 } />
			</DocsExample>
		);
	}
} );
