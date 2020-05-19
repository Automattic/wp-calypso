/**
 * External dependencies
 */

import { every } from 'lodash';
import emailValidator from 'email-validator';

export function validateFormFields( fields ) {
	if ( ! Array.isArray( fields ) || fields.length === 0 ) {
		return false;
	}
	return every( fields, ( field ) => {
		if ( field.type !== 'radio' && field.type !== 'select' ) {
			return !! field.label;
		}

		return !! field.label && !! field.options;
	} );
}

export function validateSettingsToEmail( to ) {
	const emails = to ? to.split( ',' ).map( ( email ) => email.trim() ) : [];
	return every( emails, emailValidator.validate );
}
