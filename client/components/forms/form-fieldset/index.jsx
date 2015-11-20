/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormFieldset',

	render: function() {
		return (
			<fieldset { ...omit( this.props, 'className' ) } className={ joinClasses( this.props.className, 'form-fieldset' ) } >
				{ this.props.children }
			</fieldset>
		);
	}
} );
