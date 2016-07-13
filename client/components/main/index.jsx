/** @ssr-ready **/

/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'Main',

	render: function() {
		return (
			<main className={ classnames( this.props.className, 'main' ) } role="main">
				{ this.props.children }
			</main>
		);
	}
} );
