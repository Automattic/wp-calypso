/** @format */
/**
 * External dependencies
 */
import { mapValues } from 'lodash';
import emailValidator from 'email-validator';

/**
 * Internal dependencies
 */
import { isBusiness } from 'lib/products-values';

function emailForwardingPlanLimit( plan ) {
	return isBusiness( plan ) ? 100 : 5;
}

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

module.exports = {
	emailForwardingPlanLimit,
	validateAllFields,
};
