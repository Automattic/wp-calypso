import emailValidator from 'email-validator';
import { mapValues } from 'lodash';
import { isDuplicatedEmailForwards } from 'calypso/lib/domains/email-forwarding/has-duplicated-email-forwards';

function validateAllFields( fieldValues, existingForwards = [] ) {
	return mapValues( fieldValues, ( value, fieldName ) => {
		const isValid = validateField( {
			value,
			name: fieldName,
		} );

		if ( ! isValid ) {
			return [ 'Invalid' ];
		}

		if ( name !== 'mailbox' ) {
			return [];
		}

		return isDuplicatedEmailForwards( value, existingForwards ) ? [ 'Duplicated' ] : [];
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
