/**
 * External dependencies
 */
import emailValidator from 'email-validator';
import i18n from 'i18n-calypso';
import PropTypes from 'prop-types';
import { includes, mapValues } from 'lodash';

const removePreviousErrors = ( { value } ) => ( {
	value,
	error: null,
} );

const requiredField = ( { value, error } ) => ( {
	value,
	error:
		! error && ( ! value || '' === value ) ? i18n.translate( 'This field is required.' ) : error,
} );

const sixtyCharacterField = ( { value, error } ) => ( {
	value,
	error:
		! error && 60 < value.length
			? i18n.translate( "This field can't be longer than 60 characters." )
			: error,
} );

const validEmailCharacterField = ( { value, error } ) => ( {
	value,
	error:
		! error && ! /^[0-9a-z_'-](\.?[0-9a-z_'-])*$/i.test( value )
			? i18n.translate(
					'Only number, letters, dashes, underscores, apostrophes and periods are allowed.'
			  )
			: error,
} );

const validateOverallEmail = ( { value: mailBox, error: mailBoxError }, { value: domain } ) => ( {
	value: mailBox,
	error:
		! mailBoxError && ! emailValidator.validate( `${ mailBox }@${ domain }` )
			? i18n.translate( 'Please provide a valid email address.' )
			: mailBoxError,
} );

const validateOverallEmailAgainstExistingEmails = (
	{ value: mailBox, error: mailBoxError },
	{ value: domain },
	existingGSuiteUsers
) => ( {
	value: mailBox,
	error:
		! mailBoxError &&
		includes( mapValues( existingGSuiteUsers, 'email' ), `${ mailBox }@${ domain }` )
			? i18n.translate( 'You already have this email address.' )
			: mailBoxError,
} );

function validateUser( user ) {
	// every field is required. Also scrubs previous errors.
	const { domain, mailBox, firstName, lastName } = mapValues( user, field =>
		requiredField( removePreviousErrors( field ) )
	);

	return {
		domain,
		mailBox: validateOverallEmail( validEmailCharacterField( mailBox ), domain ),
		firstName: sixtyCharacterField( firstName ),
		lastName: sixtyCharacterField( lastName ),
	};
}

const validateAgainstExistingUsers = (
	{ domain, mailBox, firstName, lastName },
	existingGSuiteUsers
) => ( {
	firstName,
	lastName,
	domain,
	mailBox: validateOverallEmailAgainstExistingEmails( mailBox, domain, existingGSuiteUsers ),
} );

function newUser( domain = '' ) {
	return {
		firstName: {
			value: '',
			error: null,
		},
		lastName: {
			value: '',
			error: null,
		},
		mailBox: {
			value: '',
			error: null,
		},
		domain: {
			value: domain,
			error: null,
		},
	};
}

function newUsers( domain ) {
	return [ newUser( domain ) ];
}

function isUserEmpty( {
	firstName: { value: firstName },
	lastName: { value: lastName },
	mailBox: { value: mailBox },
	domain: { value: domain },
} ) {
	return '' !== firstName && '' !== lastName && '' !== mailBox && '' !== domain;
}

const valueShape = PropTypes.shape( {
	value: PropTypes.string.isRequired,
	error: PropTypes.string,
} );

const userShape = PropTypes.shape( {
	firstName: valueShape,
	lastName: valueShape,
	mailBox: valueShape,
	domain: valueShape,
} );

export { isUserEmpty, newUser, newUsers, userShape, validateAgainstExistingUsers, validateUser };
