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
			<Gauge percentage={ 27 } metric={ 'test' } />
		);
	}
} );
