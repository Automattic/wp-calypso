/**
 * External dependencies
 */
import { mapValues } from 'lodash';
import emailValidator from 'email-validator';

function validateAllFields( fieldValues ) {
	return mapValues( fieldValues, ( value, fieldName ) => {
		const isValid = validateField( {
			value,
			name: fieldName,
		} );

		return isValid ? [] : [ 'Invalid' ];
	} );
}

function validateField( { name, value } ) {
	switch ( name ) {
		case 'mailbox':
			return /^[a-z0-9._+-]{1,64}$/i.test( value ) && ! /(^\.)|(\.{2,})|(\.$)/.test( value );
		case 'destination':
			return emailValidator.validate( value );
		default:
			return true;
	}
}

export { getEmailForwardsCount } from './get-email-forwards-count';
export { hasEmailForwards } from './has-email-forwards';
export { validateAllFields };
