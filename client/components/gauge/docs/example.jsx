/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var Gauge = require( 'components/gauge' );

module.exports = React.createClass( {
	displayName: 'Gauge',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/gauge">Gauge</a>
				</h2>
				<Gauge percentage={ 27 } metric={ 'test' } />
			</div>
		);
	}
} );
