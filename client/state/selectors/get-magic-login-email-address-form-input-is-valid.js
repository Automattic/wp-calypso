/**
 * External dependencies
 */
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import getMagicLoginEmailAddressFormInput from './get-magic-login-email-address-form-input';

export default function getMagicLoginEmailAddressFormInputIsValid( state ) {
	const email = getMagicLoginEmailAddressFormInput( state );
	return !! (
		typeof email === 'string' &&
		emailValidator.validate( email )
	);
}
