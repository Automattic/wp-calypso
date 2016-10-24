/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var Count = require( 'components/count' );

module.exports = React.createClass( {
	displayName: 'Count',

	mixins: [ PureRenderMixin ],

	render: function() {
		return <Count count={ 65365 } />;
	}
} );
