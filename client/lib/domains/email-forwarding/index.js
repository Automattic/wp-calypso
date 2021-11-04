import emailValidator from 'email-validator';
import { mapValues } from 'lodash';

function validateAllFields( fieldValues, existingForwards = [] ) {
	return mapValues( fieldValues, ( value, fieldName ) => {
		const isValid = validateField( {
			value,
			name: fieldName,
		} );

		if ( ! isValid ) {
			return [ 'Invalid' ];
		}

		return validateDuplicatedForward( { value, name: fieldName }, existingForwards );
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

function validateDuplicatedForward( { name, value }, existingForwards ) {
	if ( name !== 'mailbox' ) {
		return [];
	}

	return existingForwards?.some( ( forward ) => forward.mailbox === value ) ? [ 'Duplicated' ] : [];
}

export { getEmailForwardsCount } from './get-email-forwards-count';
export { hasEmailForwards } from './has-email-forwards';
export { validateAllFields };
