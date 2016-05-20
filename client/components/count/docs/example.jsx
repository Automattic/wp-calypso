/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var Count = require( 'components/count' ),
	DocsExample = require( 'components/docs-example' );

module.exports = React.createClass( {
	displayName: 'Count',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Count"
				url="/devdocs/design/count"
				componentUsageStats={ this.props.componentUsageStats }
			>
				<Count count={ 65365 } />
			</DocsExample>
		);
	}
} );
