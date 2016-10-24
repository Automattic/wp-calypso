/**
 * External dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	head = require( 'lodash/head' ),
	values = require( 'lodash/values' ),
	debug = require( 'debug' )( 'calypso:validate-fieldset' ); // eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var FormFieldset = require( 'components/forms/form-fieldset' ),
	FormInputValidation = require( 'components/forms/form-input-validation' );

module.exports = React.createClass( {
	displayName: 'ValidationFieldset',

	renderValidationNotice: function() {
		var validationElement = this.props.errorMessages ?
			<FormInputValidation
				isError={ true }
				isValid={ false }
				text={ head( values( this.props.errorMessages ) ) } /> :
			null;

		return <div className="validation-fieldset__validation-message">{ validationElement }</div>;
	},

	render: function() {
		var classes = classNames( 'validation-fieldset', this.props.className );

		debug( 'render validation fieldset' );

		return <FormFieldset className={ classes }>
			{ this.props.children }
			{ this.renderValidationNotice() }
		</FormFieldset>;
	}
} );
