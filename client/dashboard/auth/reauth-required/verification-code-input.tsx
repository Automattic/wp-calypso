/**
 * External dependencies
 */
import { TextControl } from '@wordpress/components';

interface VerificationCodeInputProps {
	/**
	 * ID for the input element.
	 */
	id: string;

	/**
	 * Label for the input.
	 */
	label: string;

	/**
	 * The current value of the input.
	 */
	value: string;

	/**
	 * Callback for when the value changes.
	 */
	onChange: ( value: string ) => void;

	/**
	 * Whether the input should show an error state.
	 */
	isError?: boolean;

	/**
	 * The verification method ('sms' or 'app').
	 */
	method?: 'sms' | 'app';
}

/**
 * A component for entering verification codes for two-factor authentication.
 */
export default function VerificationCodeInput( {
	id,
	label,
	value,
	onChange,
	isError = false,
	method = 'app',
}: VerificationCodeInputProps ) {
	// The max length for the verification code
	const maxLength = method === 'sms' ? 6 : 8;

	// Allow only digits in the input
	const handleChange = ( newValue: string ) => {
		// Strip non-digits and limit to maxLength
		const sanitized = newValue.replace( /\D/g, '' ).substring( 0, maxLength );
		onChange( sanitized );
	};

	return (
		<TextControl
			id={ id }
			label={ label }
			value={ value }
			onChange={ handleChange }
			autoFocus // eslint-disable-line jsx-a11y/no-autofocus
			maxLength={ maxLength }
			type="tel" // Use tel for better mobile keyboard
			pattern="[0-9]*"
			inputMode="numeric"
			style={ {
				maxWidth: '100%',
				// Add some error styling
				borderColor: isError ? 'var(--color-error, #d63638)' : undefined,
			} }
			className={ isError ? 'has-error' : undefined }
		/>
	);
}
