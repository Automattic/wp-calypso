/**
 * External dependencies
 */
import { compact, flatten, includes, isEmpty, mapValues, property, some, values } from 'lodash';
import i18n from 'i18n-calypso';
import emailValidator from 'email-validator';

export function filter( { users, fields } ) {
	return users.filter( function ( user, index ) {
		const isFirst = index === 0;
		const hasInput = some( Object.keys( fields ), ( name ) => user[ name ].value );

		return isFirst || hasInput;
	} );
}

export function validate( { users, fields }, existingUsers = null ) {
	users = filter( { users, fields } );
	users = users.map( function ( user ) {
		return mapValues( user, function ( field, key ) {
			let error = null;

			if ( isEmpty( field.value ) && key !== 'wasUserEdited' ) {
				error = i18n.translate( 'This field is required.' );
			} else if ( includes( [ 'firstName', 'lastName' ], key ) ) {
				if ( field.value.length > 60 ) {
					error = i18n.translate( "This field can't be longer than 60 characters." );
				}
			} else if ( includes( [ 'email', 'username' ], key ) ) {
				const newEmail = `${ field.value }@${ user.domain.value }`;

				if ( ! /^[0-9a-z_'-](\.?[0-9a-z_'-])*$/i.test( field.value ) ) {
					error = i18n.translate(
						'Only number, letters, dashes, underscores, apostrophes and periods are allowed.'
					);
				} else if ( ! emailValidator.validate( newEmail ) ) {
					error = i18n.translate( 'Please provide a valid email address.' );
				} else if ( null !== existingUsers ) {
					if (
						includes(
							mapValues( existingUsers, function ( existingUser ) {
								return existingUser.email;
							} ),
							newEmail
						)
					) {
						error = i18n.translate( 'You already have this email address.' );
					}
				}
			}

			return Object.assign( {}, field, { error } );
		} );
	} );

	const errors = compact(
		flatten( users.map( ( user ) => values( user ).map( property( 'error' ) ) ) )
	);

	return {
		errors,
		users,
	};
}
