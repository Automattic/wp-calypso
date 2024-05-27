import classNames from 'classnames';
import PropTypes from 'prop-types';
import FormTextInput from 'calypso/components/forms/form-text-input';

export default function FormTelInput( { className, isError = false, isValid = false, ...props } ) {
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
