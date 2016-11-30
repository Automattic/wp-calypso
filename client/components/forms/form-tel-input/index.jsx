/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

export default function FormTelInput( { className, isError, ...props } ) {
	const classes = classNames( 'form-tel-input', className, {
		'is-error': isError
	} );

	return <input { ...props } type="tel" pattern="[0-9]*" className={ classes } />;
}

FormTelInput.propTypes = {
	className: PropTypes.string,
	isError: PropTypes.bool
};

FormTelInput.defaultProps = {
	isError: false
};
