import { isGoogleWorkspaceProductSlug, isGSuiteProductSlug } from '@automattic/calypso-products';
import emailValidator from 'email-validator';
import { translate, TranslateResult } from 'i18n-calypso';
import { v4 as uuidv4 } from 'uuid';
import { googleApps, googleAppsExtraLicenses } from 'calypso/lib/cart-values/cart-items';
import { getGSuiteMailboxCount, hasGSuiteWithUs } from 'calypso/lib/gsuite';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { ResponseDomain } from 'calypso/lib/domains/types';

// exporting these in the big export below causes trouble
export interface GSuiteNewUserField {
	value: string;
	error: TranslateResult | null;
}

export interface GSuiteNewUser {
	uuid: string;
	domain: GSuiteNewUserField;
	mailBox: GSuiteNewUserField;
	firstName: GSuiteNewUserField;
	lastName: GSuiteNewUserField;
	password: GSuiteNewUserField;
}

export interface GSuiteProductUser {
	firstname: string;
	lastname: string;
	email: string;
	password: string;
	passwordResetEmail?: string;
}

/**
 * Retrieves all fields from the specified user.
 *
 * @param {object} user - user with a list of fields
 */
const getFields = ( user: GSuiteNewUser ): GSuiteNewUserField[] => [
	user.domain,
	user.mailBox,
	user.firstName,
	user.lastName,
	user.password,
];

/**
 * Retrieves the specified user after applying a callback to all of its fields.
 *
 * @param {object} user - user with a list of fields
 * @param {Function} callback - function to call for each field
 */
const mapFieldValues = (
	user: GSuiteNewUser,
	callback: (
		fieldValue: GSuiteNewUserField,
		fieldName: string,
		user: GSuiteNewUser
	) => GSuiteNewUserField
): GSuiteNewUser => ( {
	uuid: user.uuid,
	domain: callback( user.domain, 'domain', user ),
	mailBox: callback( user.mailBox, 'mailBox', user ),
	firstName: callback( user.firstName, 'firstName', user ),
	lastName: callback( user.lastName, 'lastName', user ),
	password: callback( user.password, 'password', user ),
} );

/*
 * Clears all previous errors from the specified field.
 */
const removePreviousErrors = ( { value }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
	error: null,
} );

/*
 * Adds a new error to the specified field if it has no errors and its value is empty.
 */
const requiredField = ( { value, error }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
	error:
		! error && ( ! value || '' === value.trim() ) ? translate( 'This field is required.' ) : error,
} );

/*
 * Adds a new error to the specified field if it has no errors and is more than sixty characters.
 */
const sixtyCharacterField = ( { value, error }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
	error:
		! error && 60 < value.length
			? translate( "This field can't be longer than %s characters.", {
					args: '60',
			  } )
			: error,
} );

/*
 * Adds a new error to the specified email field if it has no errors and contains invalid characters.
 */
const validEmailCharacterField = ( { value, error }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
	error:
		! error && ! /^[0-9a-z_'-](\.?[0-9a-z_'-])*$/i.test( value )
			? translate(
					'Only numbers, letters, dashes, underscores, apostrophes and periods are allowed.'
			  )
			: error,
} );

/**
 * Sanitizes the specified email address by removing any character that is not allowed, and converting it to lowercase.
 *
 * @param {string} email - email address
 */
const sanitizeEmail = ( email: string ): string =>
	email.replace( /[^0-9a-z_'.-]/gi, '' ).toLowerCase();

/*
 * Adds a new error if the mailbox has no errors and the email address is invalid.
 */
const validateOverallEmail = (
	{ value: mailBox, error: mailBoxError }: GSuiteNewUserField,
	{ value: domain }: GSuiteNewUserField
): GSuiteNewUserField => ( {
	value: mailBox,
	error:
		! mailBoxError && ! emailValidator.validate( `${ mailBox }@${ domain }` )
			? translate( 'Please provide a valid email address.' )
			: mailBoxError,
} );

/*
 * Adds a new error if the mailbox has no errors and matches an existing email address.
 */
const validateOverallEmailAgainstExistingEmails = (
	{ value: mailBox, error: mailBoxError }: GSuiteNewUserField,
	{ value: domain }: GSuiteNewUserField,
	existingGSuiteUsers: GSuiteProductUser[]
): GSuiteNewUserField => ( {
	value: mailBox,
	error:
		! mailBoxError &&
		existingGSuiteUsers.some(
			( existingGSuiteUser ) => existingGSuiteUser?.email === `${ mailBox }@${ domain }`
		)
			? translate( 'You already have this email address.' )
			: mailBoxError,
} );

/*
 * Clears all previous errors from all fields for the specified user.
 */
const clearPreviousErrors = ( users: GSuiteNewUser[] ): GSuiteNewUser[] => {
	return users.map( ( user ) =>
		mapFieldValues( user, ( field ) => removePreviousErrors( field ) )
	);
};

/*
 * Adds a new error if the specified mailbox field has no errors and appears more than once in the provided map.
 */
const validateNewUserMailboxIsUnique = (
	{ value: mailBox, error: previousError }: GSuiteNewUserField,
	mailboxesByCount: { [ mailbox: string ]: number }
) => ( {
	value: mailBox,
	error:
		mailboxesByCount[ mailBox ] > 1
			? translate( 'Please use a unique mailbox for each user.' )
			: previousError,
} );

/*
 * Adds a duplicate error to each mailBox with a duplicate mailbox
 */
const validateNewUsersAreUnique = ( users: GSuiteNewUser[] ): GSuiteNewUser[] => {
	const mailBoxesByCount = users.reduce( ( result: Record< string, number >, user ) => {
		const mailBoxName = user.mailBox.value;

		result[ mailBoxName ] = 1 + ( result[ mailBoxName ] ?? 0 );

		return result;
	}, {} );

	return users.map( ( { uuid, domain, mailBox, firstName, lastName, password } ) => ( {
		uuid,
		firstName,
		lastName,
		domain,
		mailBox: validateNewUserMailboxIsUnique( mailBox, mailBoxesByCount ),
		password,
	} ) );
};

/*
 * Validates the specified password field.
 *
 * @see https://support.google.com/accounts/answer/32040 for requirements
 */
const validatePasswordField = (
	{ value, error }: GSuiteNewUserField,
	minimumLength = 12
): GSuiteNewUserField => {
	if ( ! error && minimumLength > value.length ) {
		return {
			value,
			error: translate( "This field can't be shorter than %s characters.", {
				args: String( minimumLength ),
			} ),
		};
	}

	if ( ! error && 100 < value.length ) {
		return {
			value,
			error: translate( "This field can't be longer than %s characters.", { args: '100' } ),
		};
	}

	if ( ! error && value.startsWith( ' ' ) ) {
		return {
			value,
			error: translate( "This field can't start with a white space." ),
		};
	}

	// Checks that passwords only have ASCII characters (see https://en.wikipedia.org/wiki/ASCII#Character_set)
	const regexp = /[^\x20-\x7E]/;

	if ( ! error && regexp.test( value ) ) {
		const firstForbiddenCharacter = [ ...value ].find( ( character ) => regexp.test( character ) );

		return {
			value,
			error: translate( "This field can't accept '%s' as character.", {
				args: firstForbiddenCharacter,
				comment: '%s denotes a single character that is not allowed in this field',
			} ),
		};
	}

	if ( ! error && value.endsWith( ' ' ) ) {
		return {
			value,
			error: translate( "This field can't end with a white space." ),
		};
	}

	return { value, error };
};

/*
 * Run all validations on a user.
 */
const validateUser = ( user: GSuiteNewUser ): GSuiteNewUser => {
	const { domain, mailBox, firstName, lastName, password } = mapFieldValues( user, ( field ) =>
		requiredField( field )
	);

	return {
		uuid: user.uuid,
		domain,
		mailBox: validateOverallEmail( validEmailCharacterField( mailBox ), domain ),
		firstName: sixtyCharacterField( firstName ),
		lastName: sixtyCharacterField( lastName ),
		password: validatePasswordField( password ),
	};
};

/*
 * Run a full validation on all users
 */
const validateUsers = (
	users: GSuiteNewUser[],
	extraValidation: ( user: GSuiteNewUser ) => GSuiteNewUser = ( user ) => user
): GSuiteNewUser[] => {
	// 1. scrub all previous errors with clearPreviousErrors
	// 2. first check for uniqueness with validateNewUsersAreUnique
	// 3. then run the standard validateUser on each user
	// 4. finally run extraValidation on each user
	return validateNewUsersAreUnique( clearPreviousErrors( users ) )
		.map( validateUser )
		.map( extraValidation );
};

const validateAgainstExistingUsers = (
	{ uuid, domain, mailBox, firstName, lastName, password }: GSuiteNewUser,
	existingGSuiteUsers: GSuiteProductUser[]
): GSuiteNewUser => ( {
	uuid,
	firstName,
	lastName,
	domain,
	mailBox: validateOverallEmailAgainstExistingEmails( mailBox, domain, existingGSuiteUsers ),
	password,
} );

const newField = ( value = '' ): GSuiteNewUserField => ( {
	value,
	error: null,
} );

const newUser = ( domain = '' ): GSuiteNewUser => {
	return {
		uuid: uuidv4(),
		firstName: newField(),
		lastName: newField(),
		mailBox: newField(),
		domain: newField( domain ),
		password: newField(),
	};
};

const newUsers = ( domain: string ): GSuiteNewUser[] => {
	return [ newUser( domain ) ];
};

const isUserComplete = ( user: GSuiteNewUser ): boolean => {
	return getFields( user ).every( ( { value } ) => '' !== value );
};

const doesUserHaveError = ( user: GSuiteNewUser ): boolean => {
	return getFields( user ).some( ( { error } ) => null !== error );
};

/**
 * Returns if a user is ready to be added as a new email aka valid
 *
 * @param user user to check
 * @returns boolean if the user is valid or not
 */
const isUserValid = ( user: GSuiteNewUser ): boolean =>
	isUserComplete( user ) && ! doesUserHaveError( user );

const areAllUsersValid = ( users: GSuiteNewUser[] ): boolean =>
	0 < users.length && users.every( isUserValid );

const transformUserForCart = ( {
	firstName: { value: firstname },
	lastName: { value: lastname },
	domain: { value: domain },
	mailBox: { value: mailBox },
	password: { value: password },
}: GSuiteNewUser ): GSuiteProductUser => ( {
	email: `${ mailBox }@${ domain }`.toLowerCase(),
	firstname,
	lastname,
	password,
} );

const getItemsForCart = (
	domains: ResponseDomain[],
	productSlug: string,
	users: GSuiteNewUser[]
): MinimalRequestCartProduct[] => {
	const usersGroupedByDomain = users.reduce(
		( result: Record< string, GSuiteProductUser[] >, user: GSuiteNewUser ) => {
			if ( ! result[ user.domain.value ] ) {
				result[ user.domain.value ] = [];
			}

			result[ user.domain.value ].push( transformUserForCart( user ) );

			return result;
		},
		{}
	);

	return Object.entries( usersGroupedByDomain ).map( ( [ domainName, groupedUsers ] ) => {
		const properties: Record< string, unknown > = { domain: domainName, users: groupedUsers };

		const domain = domains.find( ( domain ) => domain.name === domainName );

		const isExtraLicense = domain && hasGSuiteWithUs( domain );

		if ( isGSuiteProductSlug( productSlug ) && isExtraLicense ) {
			return googleAppsExtraLicenses( {
				domain: domainName,
				users: groupedUsers,
			} );
		}

		if ( isGoogleWorkspaceProductSlug( productSlug ) && isExtraLicense ) {
			properties[ 'new_quantity' ] = groupedUsers.length;
			properties[ 'quantity' ] = getGSuiteMailboxCount( domain ) + groupedUsers.length;
		}

		if ( isGoogleWorkspaceProductSlug( productSlug ) && ! isExtraLicense ) {
			properties[ 'quantity' ] = groupedUsers.length;
		}

		return googleApps( { ...properties, product_slug: productSlug } );
	} );
};

export {
	areAllUsersValid,
	clearPreviousErrors,
	doesUserHaveError,
	getItemsForCart,
	isUserComplete,
	isUserValid,
	newUser,
	newUsers,
	sanitizeEmail,
	validateAgainstExistingUsers,
	validateNewUsersAreUnique,
	validatePasswordField,
	validateUser,
	validateUsers,
};
