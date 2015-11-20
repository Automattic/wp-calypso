/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' );

var PulsingDot = React.createClass( {

	getDefaultProps: function() {
		return {
			active: false
		};
	},

	render: function() {
		var className = classnames( {
			'pulsing-dot': true,
			'is-active': this.props.active
		} );
		return (
			<div className={ className } />
		);
	}

} );

module.exports = PulsingDot;
