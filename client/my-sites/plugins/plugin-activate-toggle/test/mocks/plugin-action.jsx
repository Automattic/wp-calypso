/**
 * External dependencies
 */
var React = require( 'react/addons' );

module.exports = React.createClass( {
	render: function() {
		return <div className="plugin-action" onClick={ this.props.action }></div>;
	}
} );
