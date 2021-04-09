/**
 * External dependencies
 */
import React from 'react';
import emailValidator from 'email-validator';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';
import { v4 as uuidv4 } from 'uuid';

/**
 * Internal dependencies
 */
import { validatePasswordField } from 'calypso/lib/gsuite/new-users';
import wp from 'calypso/lib/wp';

const valueIsBoolean = ( value ) => typeof value === 'boolean';
const valueIsNonEmpty = ( value ) => value !== '';
const valueIsOptional = () => true;

const MAILBOX_FIELDS = {
	alternativeEmail: valueIsNonEmpty,
	domain: valueIsNonEmpty,
	isAdmin: valueIsBoolean,
	mailbox: valueIsNonEmpty,
	name: valueIsNonEmpty,
	password: valueIsNonEmpty,
};

const getMailboxRequiredBooleanValue = () =>
	PropTypes.shape( {
		value: PropTypes.bool.isRequired,
		error: PropTypes.string,
	} );

const getMailboxOptionalStringOrArrayValue = () =>
	PropTypes.shape( {
		value: PropTypes.string.isRequired,
		error: PropTypes.oneOfType( PropTypes.string, PropTypes.array ),
	} );

const getMailboxRequiredStringValue = () =>
	PropTypes.shape( {
		value: PropTypes.string.isRequired,
		error: PropTypes.string,
	} ).isRequired;

const getMailboxRequiredStringOrArrayValue = () =>
	PropTypes.shape( {
		value: PropTypes.string.isRequired,
		error: PropTypes.oneOfType( PropTypes.string, PropTypes.array ),
	} ).isRequired;

const getMailboxPropTypeShape = () =>
	PropTypes.shape( {
		uuid: PropTypes.string.isRequired,
		alternativeEmail: getMailboxOptionalStringOrArrayValue(),
		domain: getMailboxRequiredStringValue(),
		isAdmin: getMailboxRequiredBooleanValue(),
		mailbox: getMailboxRequiredStringOrArrayValue(),
		name: getMailboxRequiredStringValue(),
		password: getMailboxRequiredStringValue(),
	} );

const sanitizeEmailSuggestion = ( emailSuggestion ) =>
	String( emailSuggestion )
		.replace( /[^0-9a-z_'.-]/gi, '' )
		.toLowerCase();

const validateMailboxesAreUnique = ( mailboxes ) => {
	const mailboxNameCounts = mailboxes.reduce( ( nameCount, mailbox ) => {
		nameCount[ mailbox.mailbox ] = 1 + nameCount[ mailbox.mailbox ] ?? 0;
		return nameCount;
	}, {} );

	return mailboxes.map( ( mailbox ) => {
		if ( mailboxNameCounts[ mailbox.mailbox ] > 1 ) {
			return {
				...mailbox,
				[ mailbox ]: { value: mailbox.mailbox, error: translate( 'Please use unique mailboxes' ) },
			};
		}
		return mailbox;
	} );
};

const mapMailboxFields = ( mailbox, callback, skipFields = [] ) => {
	return Object.entries( mailbox )
		.map( ( entry ) => {
			const fieldName = entry[ 0 ];
			if ( fieldName === 'uuid' || skipFields.includes( fieldName ) ) {
				return entry;
			}
			const fieldValue = entry[ 1 ];
			return [ fieldName, callback( fieldValue, fieldName ) ];
		} )
		.reduce( ( updatedMailbox, entry ) => {
			updatedMailbox[ entry[ 0 ] ] = entry[ 1 ];
			return updatedMailbox;
		}, {} );
};

const removePreviousError = ( { value } ) => ( { value, error: null } );

const clearPreviousErrors = ( mailboxes ) => {
	return mailboxes.map( ( mailbox ) => mapMailboxFields( mailbox, removePreviousError ) );
};

const validateRequiredField = ( { value, error } ) => ( {
	value,
	error:
		! error && typeof value !== 'boolean' && ( ! value || '' === value.trim() )
			? translate( 'This field is required.' )
			: error,
} );

const validateRequiredMailboxFields = ( mailbox, optionalFields = [] ) => {
	return mapMailboxFields( mailbox, validateRequiredField, optionalFields );
};

const validateFullEmailAddress = ( { value, error }, allowEmpty = false ) => {
	if ( error ) {
		return { value, error };
	}
	if ( allowEmpty && value === '' ) {
		return { value, error };
	}
	if ( emailValidator.validate( value ) ) {
		return { value, error };
	}
	return {
		value,
		error: translate( 'Please supply a valid email address.' ),
	};
};

const validateAlternativeEmailAddress = ( { value, error }, domainName, allowEmpty = false ) => {
	if ( ! error && value && domainName ) {
		const parts = `${ value }`.split( '@' );
		if ( parts.length > 1 && parts[ 1 ].toLowerCase() === domainName.toLowerCase() ) {
			return {
				value,
				error: translate(
					'Please supply an email address on a different domain than {{strong}}%(domain)s{{/strong}}',
					{
						args: {
							domain: domainName,
						},
						components: {
							strong: <strong />,
						},
					}
				),
			};
		}
	}

	return validateFullEmailAddress( { value, error }, allowEmpty );
};

const validateMailboxName = ( { value, error }, { value: domainName, error: domainError } ) => {
	if ( error ) {
		return { value, error };
	}
	if ( ! /^[0-9a-z_-](\.?[0-9a-z_-])*$/i.test( value ) ) {
		return {
			value,
			error: translate( 'Only numbers, letters, dashes, underscores, and periods are allowed.' ),
		};
	}
	if ( ! domainError && domainName && ! emailValidator.validate( `${ value }@${ domainName }` ) ) {
		return {
			value,
			error: translate( 'Please supply a valid email address.' ),
		};
	}
	return { value, error };
};

const validateName = ( name ) => {
	// TODO: validate the user's name
	return name;
};

const validatePassword = ( { value, error } ) => validatePasswordField( { value, error }, 10 );

const validateMailbox = ( mailbox, optionalFields = [] ) => {
	const {
		alternativeEmail,
		domain,
		mailbox: mailboxName,
		name,
		password,
	} = validateRequiredMailboxFields( mailbox, optionalFields );

	return {
		uuid: mailbox.uuid,
		alternativeEmail: validateAlternativeEmailAddress(
			alternativeEmail,
			domain.value,
			optionalFields.includes( 'alternativeEmail' )
		),
		domain,
		isAdmin: mailbox.isAdmin,
		mailbox: validateMailboxName( mailboxName, domain ),
		name: validateName( name ),
		password: validatePassword( password ),
	};
};

const validateMailboxes = ( mailboxes, optionalFields = [] ) => {
	return validateMailboxesAreUnique( clearPreviousErrors( mailboxes ) ).map( ( mailbox ) =>
		validateMailbox( mailbox, optionalFields )
	);
};

const buildNewTitanMailbox = ( domain, isAdmin = false ) => {
	return {
		uuid: uuidv4(),
		alternativeEmail: { value: '', error: null },
		domain: { value: domain, error: null },
		isAdmin: { value: isAdmin, error: null },
		mailbox: { value: '', error: null },
		name: { value: '', error: null },
		password: { value: '', error: null },
	};
};

const isMailboxComplete = ( mailbox, optionalFields = [] ) =>
	Object.entries( MAILBOX_FIELDS ).every( ( requiredField ) => {
		const [ fieldName, validator ] = requiredField;
		if ( optionalFields.includes( fieldName ) ) {
			return valueIsOptional( mailbox[ fieldName ].value );
		}
		return validator( mailbox[ fieldName ].value );
	} );

const doesMailboxHaveErrors = ( mailbox ) =>
	Object.keys( MAILBOX_FIELDS ).some( ( fieldName ) => null !== mailbox[ fieldName ].error );

const isMailboxValid = ( mailbox, optionalFields = [] ) =>
	isMailboxComplete( mailbox, optionalFields ) && ! doesMailboxHaveErrors( mailbox );

const areAllMailboxesValid = ( mailboxes, optionalFields = [] ) =>
	0 < mailboxes.length &&
	mailboxes.every( ( mailbox ) => isMailboxValid( mailbox, optionalFields ) );

const transformMailboxForCart = ( {
	alternativeEmail: { value: alternativeEmail },
	domain: { value: domain },
	isAdmin: { value: isAdmin },
	mailbox: { value: mailbox },
	name: { value: name },
	password: { value: password },
} ) => ( {
	alternative_email: alternativeEmail,
	email: `${ mailbox }@${ domain }`,
	is_admin: isAdmin,
	name,
	password,
} );

const checkEmailAvailability = async ( emailAddress ) => {
	try {
		await wp.undocumented().getTitanEmailAddressAvailability( emailAddress );
		return true;
	} catch ( e ) {
		return e.statusCode !== 409;
	}
};

const decorateMailboxWithExistenceError = ( mailbox ) => {
	mailbox.mailbox.error = translate( '{{strong}}%(email)s{{/strong}} already exists.', {
		args: {
			email: mailbox.mailbox.value,
		},
		components: {
			strong: <strong />,
		},
	} );
	return mailbox;
};

const areAllMailboxesAvailable = async ( mailboxes, onMailboxesChange ) => {
	const promisified_checks = Promise.all(
		mailboxes.map( ( mailbox ) => {
			const email = `${ mailbox.mailbox.value }@${ mailbox.domain.value }`;
			return checkEmailAvailability( email );
		} )
	);
	const checks = await promisified_checks;
	checks
		.map( ( check, index ) => ( { check, mailbox: mailboxes[ index ] } ) )
		.filter( ( { check } ) => ! check )
		.forEach( ( { mailbox } ) => decorateMailboxWithExistenceError( mailbox ) );
	const result = checks.every( ( check ) => check );
	! result && onMailboxesChange && onMailboxesChange( mailboxes );
	return result;
};

export {
	areAllMailboxesAvailable,
	areAllMailboxesValid,
	buildNewTitanMailbox,
	getMailboxPropTypeShape,
	sanitizeEmailSuggestion,
	transformMailboxForCart,
	validateMailboxes,
};
