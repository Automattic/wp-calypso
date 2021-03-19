/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';
import { v4 as uuidv4 } from 'uuid';

/**
 * Internal dependencies
 */
import { validatePasswordField } from 'calypso/lib/gsuite/new-users';

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

const getMailboxOptionalStringValue = () =>
	PropTypes.shape( {
		value: PropTypes.string.isRequired,
		error: PropTypes.string,
	} );

const getMailboxRequiredStringValue = () =>
	PropTypes.shape( {
		value: PropTypes.string.isRequired,
		error: PropTypes.string,
	} ).isRequired;

const getMailboxPropTypeShape = () =>
	PropTypes.shape( {
		uuid: PropTypes.string.isRequired,
		alternativeEmail: getMailboxOptionalStringValue(),
		domain: getMailboxRequiredStringValue(),
		isAdmin: getMailboxRequiredBooleanValue(),
		mailbox: getMailboxRequiredStringValue(),
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
	const invalidEmailAddressError = translate( 'Please supply a valid email address.' );
	const emailParts = value.split( '@' );
	if ( emailParts.length !== 2 ) {
		return {
			value,
			error: invalidEmailAddressError,
		};
	}

	// TODO: improve this check to support internationalized SLDs and TLDs
	const emailDomain = emailParts[ 1 ];
	if ( ! /^[a-z0-9].*\.[a-z]{2,3}$/i.test( emailDomain ) ) {
		return {
			value,
			error: invalidEmailAddressError,
		};
	}

	const mailboxName = emailParts[ 0 ];
	// Note that this expression allows + symbols in local names
	if ( ! /^[0-9a-z_-](\.?[0-9a-z_+-])*$/i.test( mailboxName ) ) {
		return {
			value,
			error: invalidEmailAddressError,
		};
	}

	return { value, error };
};

const validateMailboxName = ( { value, error } ) => ( {
	value,
	error:
		! error && ! /^[0-9a-z_-](\.?[0-9a-z_-])*$/i.test( value )
			? translate( 'Only numbers, letters, dashes, underscores, and periods are allowed.' )
			: error,
} );

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
		alternativeEmail: validateFullEmailAddress(
			alternativeEmail,
			optionalFields.includes( 'alternativeEmail' )
		),
		domain,
		isAdmin: mailbox.isAdmin,
		mailbox: validateMailboxName( mailboxName ),
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

export {
	areAllMailboxesValid,
	buildNewTitanMailbox,
	getMailboxPropTypeShape,
	sanitizeEmailSuggestion,
	transformMailboxForCart,
	validateMailboxes,
};
