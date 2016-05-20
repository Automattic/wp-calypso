/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var DocsExample = require( 'components/docs-example' ),
	Rating = require( 'components/rating' );

module.exports = React.createClass( {
	displayName: 'Rating',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Rating"
				url="/devdocs/design/rating"
				componentUsageStats={ this.props.componentUsageStats }
			>
				<Rating rating={ 65 } size={ 50 } />
			</DocsExample>
		);
	}
} );
