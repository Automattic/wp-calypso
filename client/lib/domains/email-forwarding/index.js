import emailValidator from 'email-validator';
import { mapValues } from 'lodash';
import { hasTooManyEmailForwardsForMailbox } from 'calypso/lib/domains/email-forwarding/has-too-many-email-forwards';

export function validateAllFields( fieldValues, existingEmailForwards = [] ) {
	return mapValues( fieldValues, ( value, fieldName ) => {
		const isValid = validateField( {
			value,
			name: fieldName,
		} );

		if ( ! isValid ) {
			return [ 'Invalid' ];
		}

		if ( fieldName !== 'mailbox' ) {
			return [];
		}

		return hasTooManyEmailForwardsForMailbox( value, existingEmailForwards ) ? [ 'Exhausted' ] : [];
	} );
}

export function validateField( { name, value } ) {
	switch ( name ) {
		case 'mailbox':
			return /^[a-z0-9._+-]{1,64}$/i.test( value ) && ! /(^\.)|(\.{2,})|(\.$)/.test( value );
		case 'destinations': {
			const nonEmpty = value.filter( ( v ) => v.trim() );
			const hasDuplicates = value.length !== new Set( value ).size;
			return (
				! hasDuplicates &&
				nonEmpty.length &&
				nonEmpty.every( ( v ) => emailValidator.validate( v ) )
			);
		}
		default:
			return true;
	}
}

export { getEmailForwardsCount } from './get-email-forwards-count';
export { hasEmailForwards } from './has-email-forwards';
export { getDomainsWithEmailForwards } from './get-domains-with-email-forwards';
