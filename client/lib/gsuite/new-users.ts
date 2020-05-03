/**
 * External dependencies
 */
import emailValidator from 'email-validator';
import i18n, { TranslateResult } from 'i18n-calypso';
import { countBy, find, includes, groupBy, map, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { googleApps, googleAppsExtraLicenses } from 'lib/cart-values/cart-items';
import { hasGSuiteWithUs } from '.';

// exporting these in the big export below causes trouble
export interface GSuiteNewUserField {
	value: string;
	error: TranslateResult | null;
}

export interface GSuiteNewUser {
	domain: GSuiteNewUserField;
	mailBox: GSuiteNewUserField;
	firstName: GSuiteNewUserField;
	lastName: GSuiteNewUserField;
}

export interface GSuiteProductUser {
	firstname: string;
	lastname: string;
	email: string;
}
/*
 * Clear all previous errors from a field
 */
const removePreviousErrors = ( { value }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
	error: null,
} );

/*
 * Add a new error if field has no errors and value is empty
 */
const requiredField = ( { value, error }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
	error:
		! error && ( ! value || '' === value.trim() )
			? i18n.translate( 'This field is required.' )
			: error,
} );

/*
 * Add a new error if field has no errors and is more than sixty characters
 */
const sixtyCharacterField = ( { value, error }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
	error:
		! error && 60 < value.length
			? i18n.translate( "This field can't be longer than %s characters.", {
					args: '60',
			  } )
			: error,
} );

/*
 * Add a new error if field has no errors and contains invalid characters
 */
const validEmailCharacterField = ( { value, error }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
	error:
		! error && ! /^[0-9a-z_'-](\.?[0-9a-z_'-])*$/i.test( value )
			? i18n.translate(
					'Only number, letters, dashes, underscores, apostrophes and periods are allowed.'
			  )
			: error,
} );

/*
 * Add a new error if the mailBox field has no errors and the full email failed the emailValidator
 */
const validateOverallEmail = (
	{ value: mailBox, error: mailBoxError }: GSuiteNewUserField,
	{ value: domain }: GSuiteNewUserField
): GSuiteNewUserField => ( {
	value: mailBox,
	error:
		! mailBoxError && ! emailValidator.validate( `${ mailBox }@${ domain }` )
			? i18n.translate( 'Please provide a valid email address.' )
			: mailBoxError,
} );

/*
 * Add a new error if the mailBox field has no errors and the existing mailboxes matches the field
 */
const validateOverallEmailAgainstExistingEmails = (
	{ value: mailBox, error: mailBoxError }: GSuiteNewUserField,
	{ value: domain }: GSuiteNewUserField,
	existingGSuiteUsers: any[]
): GSuiteNewUserField => ( {
	value: mailBox,
	error:
		! mailBoxError &&
		includes( mapValues( existingGSuiteUsers, 'email' ), `${ mailBox }@${ domain }` )
			? i18n.translate( 'You already have this email address.' )
			: mailBoxError,
} );

/*
 * Clear all previous errors from all fields on a User
 */
const clearPreviousErrors = ( users: GSuiteNewUser[] ) => {
	return users.map( ( user ) => mapValues( user, ( field ) => removePreviousErrors( field ) ) );
};

/*
 *  Add a new error if the mailBox field has no errors and the mailBox appear more than once in the map
 */
const validateNewUserMailboxIsUnique = (
	{ value: mailBox, error: previousError }: GSuiteNewUserField,
	mailboxesByCount: { [ mailbox: string ]: number }
) => ( {
	value: mailBox,
	error:
		mailboxesByCount[ mailBox ] > 1
			? i18n.translate( 'Please use a unique mailbox for each user.' )
			: previousError,
} );

/*
 * Adds a duplicate error to each mailBox with a duplicate mailbox
 */
const validateNewUsersAreUnique = ( users: GSuiteNewUser[] ) => {
	const mailboxesByCount: { [ mailbox: string ]: number } = countBy(
		users.map( ( { mailBox: { value: mailBox } } ) => mailBox )
	);

	return users.map( ( { domain, mailBox, firstName, lastName } ) => ( {
		firstName,
		lastName,
		domain,
		mailBox: validateNewUserMailboxIsUnique( mailBox, mailboxesByCount ),
	} ) );
};

/*
 * Run all validations on a user:
 * domain - required
 * mailBox - required, vaildEmailCharacters, valid overall email
 * firstName - required, less than sixty characters
 * lastName - required, less than sixty characters
 */
const validateUser = ( user: GSuiteNewUser ): GSuiteNewUser => {
	// every field is required. Also scrubs previous errors.
	const { domain, mailBox, firstName, lastName } = mapValues( user, ( field ) =>
		requiredField( field )
	);

	return {
		domain,
		mailBox: validateOverallEmail( validEmailCharacterField( mailBox ), domain ),
		firstName: sixtyCharacterField( firstName ),
		lastName: sixtyCharacterField( lastName ),
	};
};

/*
 * Run a full validation on all users
 */
const validateUsers = (
	users: GSuiteNewUser[],
	extraValidation: ( user: GSuiteNewUser ) => GSuiteNewUser = ( user ) => user
) => {
	// 1. scrub all previous errors with clearPreviousErrors
	// 2. first check for uniqueness with validateNewUsersAreUnique
	// 3. then run the standard validateUser on each user
	// 4. finally run extraValidation on each user
	return validateNewUsersAreUnique( clearPreviousErrors( users ) )
		.map( validateUser )
		.map( extraValidation );
};

const validateAgainstExistingUsers = (
	{ domain, mailBox, firstName, lastName }: GSuiteNewUser,
	existingGSuiteUsers: any[]
) => ( {
	firstName,
	lastName,
	domain,
	mailBox: validateOverallEmailAgainstExistingEmails( mailBox, domain, existingGSuiteUsers ),
} );

const newField = ( value: string = '' ): GSuiteNewUserField => ( {
	value,
	error: null,
} );

const newUser = ( domain: string = '' ): GSuiteNewUser => {
	return {
		firstName: newField(),
		lastName: newField(),
		mailBox: newField(),
		domain: newField( domain ),
	};
};

const newUsers = ( domain: string ): GSuiteNewUser[] => {
	return [ newUser( domain ) ];
};

const isUserComplete = ( user: GSuiteNewUser ): boolean => {
	return Object.values( user ).every( ( { value } ) => '' !== value );
};

const doesUserHaveError = ( user: GSuiteNewUser ): boolean => {
	return Object.values( user ).some( ( { error } ) => null !== error );
};

/**
 * Returns if a user is ready to be added as a new email aka valid
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
}: GSuiteNewUser ): GSuiteProductUser => ( {
	email: `${ mailBox }@${ domain }`.toLowerCase(),
	firstname,
	lastname,
} );

const getItemsForCart = (
	domains: { name: string },
	productSlug: string,
	users: GSuiteNewUser[]
) => {
	const usersGroupedByDomain: { [ domain: string ]: GSuiteProductUser[] } = mapValues(
		groupBy( users, 'domain.value' ),
		( groupedUsers ) => groupedUsers.map( transformUserForCart )
	);

	return map( usersGroupedByDomain, ( groupedUsers: GSuiteProductUser[], domain: string ) => {
		const domainInfo = find( domains, [ 'name', domain ] );
		return domainInfo && hasGSuiteWithUs( domainInfo )
			? googleAppsExtraLicenses( {
					domain,
					users: groupedUsers,
			  } )
			: googleApps( { domain, product_slug: productSlug, users: groupedUsers } );
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
	validateAgainstExistingUsers,
	validateNewUsersAreUnique,
	validateUser,
	validateUsers,
};
