/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default function FormTelInput( { className, isError, isValid, ...props } ) {
	const classes = classNames( 'form-tel-input', className, {
		'is-error': isError,
		'is-valid': isValid,
	} );

	return <input { ...props } type="tel" pattern="[0-9]*" className={ classes } />;
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
