/**
 * External dependencies
 */
var React = require( 'react' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/omit' );

module.exports = React.createClass( {

	displayName: 'FormButtonsBar',

	render: function() {
		return (
			<div
				{ ...omit( this.props, 'className' ) }
				className={ classnames( this.props.className, 'form-buttons-bar' ) } >
				{ this.props.children }
			</div>
		);
	}
} );
