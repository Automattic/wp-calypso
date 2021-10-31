import emailValidator from 'email-validator';
import { mapValues } from 'lodash';

function validateAllFields( fieldValues, existingForwards = [] ) {
	return mapValues( fieldValues, ( value, fieldName ) => {
		const isValid = validateField( {
			value,
			name: fieldName,
		} );

		return isValid
			? validateDuplicatedForward( { value, name: fieldName }, existingForwards )
			: [ 'Invalid' ];
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
	switch ( name ) {
		case 'mailbox':
			return existingForwards?.filter( ( t ) => t.mailbox === value ).length > 1
				? [ 'Repeated' ]
				: [];
		default:
			return [];
	}
}

export { getEmailForwardsCount } from './get-email-forwards-count';
export { hasEmailForwards } from './has-email-forwards';
export { validateAllFields };
