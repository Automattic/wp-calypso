/**
 * External dependencies
 */
var React = require( 'react' );

export default React.createClass( {
	render: function() {
		return <div className="plugin-action" onClick={ this.props.action }></div>;
	}
} );
