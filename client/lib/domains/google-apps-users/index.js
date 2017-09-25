/**
 * External dependencies
 */
import emailValidator from 'email-validator';
import i18n from 'i18n-calypso';
import { compact, flatten, includes, isEmpty, mapValues, property, some, values } from 'lodash';

function filter( { users, fields } ) {
	return users.filter( function( user, index ) {
		let isFirst = index === 0,
			hasInput = some( Object.keys( fields ), function( name ) {
				return user[ name ].value;
			} );

		return isFirst || hasInput;
	} );
}

function validate( { users, fields } ) {
	let errors;

	users = filter( { users, fields } );
	users = users.map( function( user ) {
		return mapValues( user, function( field, key ) {
			let error = null;

			if ( isEmpty( field.value ) ) {
				error = i18n.translate( 'This field is required.' );
			} else if ( includes( [ 'firstName', 'lastName' ], key ) ) {
				if ( field.value.length > 60 ) {
					error = i18n.translate( 'This field can\'t be longer than 60 characters.' );
				}
			} else if ( includes( [ 'email', 'username' ], key ) ) {
				if ( ! /^[0-9a-z_'-](\.?[0-9a-z_'-])*$/i.test( field.value ) ) {
					error = i18n.translate( 'Only number, letters, dashes, underscores, apostrophes and periods are allowed.' );
				} else if ( ! emailValidator.validate( `${ field.value }@${ user.domain.value }` ) ) {
					error = i18n.translate( 'Please provide a valid email address.' );
				}
			}

			return Object.assign( {}, field, { error: error } );
		} );
	} );

	errors = compact( flatten( users.map( function( user ) {
		return values( user ).map( property( 'error' ) );
	} ) ) );

	return {
		errors,
		users
	};
}

export default {
	validate,
	filter
};
