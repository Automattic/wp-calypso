/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	classnames = require( 'classnames' ),
	omit = require( 'lodash/object/omit' );

module.exports = React.createClass( {

	displayName: 'FormFieldset',

	render: function() {
		return (
			<fieldset { ...omit( this.props, 'className' ) } className={ classnames( this.props.className, 'form-fieldset' ) } >
				{ this.props.children }
			</fieldset>
		);
	}
} );
