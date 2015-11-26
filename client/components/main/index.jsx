/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'Main',

	render: function() {
		return (
			<div className={ classnames( this.props.className, 'main' ) } role="main">
				{ this.props.children }
			</div>
		);
	}
} );
