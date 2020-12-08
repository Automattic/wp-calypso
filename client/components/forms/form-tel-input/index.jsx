/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import FormTextInput from 'calypso/components/forms/form-text-input';

export default function FormTelInput( { className, isError, isValid, ...props } ) {
	const classes = classNames( 'form-tel-input', className, {
		'is-error': isError,
		'is-valid': isValid,
	} );

	return <FormTextInput pattern="[0-9\-() +]*" { ...props } type="tel" className={ classes } />;
}

FormTelInput.propTypes = {
	className: PropTypes.string,
	isError: PropTypes.bool,
	isValid: PropTypes.bool,
};

FormTelInput.defaultProps = {
	isError: false,
	isValid: false,
};
