/**
 * External dependencies
 */
var some = require( 'lodash/some' ),
	mapValues = require( 'lodash/mapValues' ),
	isEmpty = require( 'lodash/isEmpty' ),
	flatten = require( 'lodash/flatten' ),
	compact = require( 'lodash/compact' ),
	values = require( 'lodash/values' ),
	property = require( 'lodash/property' ),
	endsWith = require( 'lodash/endsWith' );

/**
 * Internal dependencies
 */
var i18n = require( 'lib/mixins/i18n' );

function filter( { users, fields } ) {
	return users.filter( function( user, index ) {
		var isFirst = index === 0,
			hasInput = some( Object.keys( fields ), function( name ) {
				return user[ name ].value;
			} );

		return isFirst || hasInput;
	} );
}

function validate( { users, fields, domainSuffix } ) {
	var errors;

	users = filter( { users, fields } );
	users = users.map( function( user, index ) {
		return mapValues( user, function( field, key ) {
			var error = null,
				userNum = index + 1;

			if ( isEmpty( field.value ) ) {
				error = i18n.translate( 'User #%(userNum)s: The "%(field)s" field is required.', {
					args: {
						userNum: userNum,
						field: fields[ key ]
					}
				} );
			} else if ( domainSuffix && 'email' === key && ! endsWith( field.value, '@' + domainSuffix ) ) {
				error = i18n.translate( 'User #%(userNum)s: Email addresses must end with @%(domain)s', {
					args: {
						userNum: userNum,
						domain: domainSuffix
					}
				} );
			}

			return Object.assign( {}, field, { error: error } );
		} );
	} );

	errors = compact( flatten( users.map( function( user ) {
		return values( user ).map( property( 'error' ) );
	} ) ) );

	return {
		errors: errors,
		users: users
	};
}

module.exports = {
	validate,
	filter
};
