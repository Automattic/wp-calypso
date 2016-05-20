/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var DocsExample = require( 'components/docs-example' ),
	Gauge = require( 'components/gauge' );

module.exports = React.createClass( {
	displayName: 'Gauge',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Gauge"
				url="/devdocs/design/gauge"
				componentUsageStats={ this.props.componentUsageStats }
			>
				<Gauge percentage={ 27 } metric={ 'test' } />
			</DocsExample>
		);
	}
} );
