/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormButtonsBar',

	render: function() {
		return (
			<div
				{ ...omit( this.props, 'className' ) }
				className={ joinClasses( this.props.className, 'form-buttons-bar' ) } >
				{ this.props.children }
			</div>
		);
	}
} );
