/** @format */
/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {
	render: function() {
		return <div className="plugin-action" onClick={ this.props.action } />;
	},
} );
