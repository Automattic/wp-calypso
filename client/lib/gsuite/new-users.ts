/**
 * External dependencies
 */
import { cartItems } from 'lib/cart-values';
import emailValidator from 'email-validator';
import i18n from 'i18n-calypso';
import PropTypes from 'prop-types';
import { find, includes, groupBy, map, mapValues } from 'lodash';
import { hasGSuite } from '.';

interface GSuiteNewUserField {
	value: string;
	error?: string;
}

interface GSuiteNewUser {
	domain: GSuiteNewUserField;
	mailBox: GSuiteNewUserField;
	firstName: GSuiteNewUserField;
	lastName: GSuiteNewUserField;
}

interface GSuiteProductUser {
	firstname: string;
	lastname: string;
	email: string;
}

const removePreviousErrors = ( { value }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
} );

const requiredField = ( { value, error }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
	error:
		! error && ( ! value || '' === value ) ? i18n.translate( 'This field is required.' ) : error,
} );

const sixtyCharacterField = ( { value, error }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
	error:
		! error && 60 < value.length
			? i18n.translate( "This field can't be longer than 60 characters." )
			: error,
} );

const validEmailCharacterField = ( { value, error }: GSuiteNewUserField ): GSuiteNewUserField => ( {
	value,
	error:
		! error && ! /^[0-9a-z_'-](\.?[0-9a-z_'-])*$/i.test( value )
			? i18n.translate(
					'Only number, letters, dashes, underscores, apostrophes and periods are allowed.'
			  )
			: error,
} );

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

const validateUser = ( user: GSuiteNewUser ): GSuiteNewUser => {
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

const newUser = ( domain: string = '' ): GSuiteNewUser => {
	return {
		firstName: {
			value: '',
		},
		lastName: {
			value: '',
		},
		mailBox: {
			value: '',
		},
		domain: {
			value: domain,
		},
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

const userIsReady = ( user: GSuiteNewUser ): boolean =>
	isUserComplete( user ) && ! doesUserHaveError( user );

const transformUser = ( {
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
	const groups = mapValues( groupBy( users, 'domain.value' ), groupedUsers =>
		groupedUsers.map( transformUser )
	);

	return map( groups, ( groupedUsers, domain ) => {
		const domainInfo = find( domains, [ 'name', domain ] );

		return hasGSuite( domainInfo )
			? cartItems.gsuiteExtraLicenses( domain, groupedUsers )
			: cartItems.gsuite( domain, groupedUsers, productSlug );
	} );
};

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

export {
	doesUserHaveError,
	getItemsForCart,
	isUserComplete,
	newUser,
	newUsers,
	userIsReady,
	userShape,
	validateAgainstExistingUsers,
	validateUser,
};
