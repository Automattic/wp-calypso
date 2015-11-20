/**
 * External dependencies
 */
var React = require( 'react' ),
	joinClasses = require( 'react/lib/joinClasses' );

module.exports = React.createClass( {
	displayName: 'Main',

	render: function() {
		return (
			<div className={ joinClasses( this.props.className, 'main' ) } role="main">
				{ this.props.children }
			</div>
		);
	}
} );
