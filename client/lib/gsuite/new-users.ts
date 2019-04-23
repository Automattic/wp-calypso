/**
 * External dependencies
 */
import { cartItems } from 'lib/cart-values';
import emailValidator from 'email-validator';
import i18n from 'i18n-calypso';
import PropTypes from 'prop-types';
import { find, includes, groupBy, map, mapValues } from 'lodash';
import { hasGSuite } from '.';

interface userField {
	value: string;
	error: string | null;
}

interface user {
	domain: userField;
	mailBox: userField;
	firstName: userField;
	lastName: userField;
}

interface googleAppsProductUser {
	firstname: string;
	lastname: string;
	email: string;
}

const removePreviousErrors = ( { value }: userField ): userField => ( {
	value,
	error: null,
} );

const requiredField = ( { value, error }: userField ): userField => ( {
	value,
	error:
		! error && ( ! value || '' === value ) ? i18n.translate( 'This field is required.' ) : error,
} );

const sixtyCharacterField = ( { value, error }: userField ): userField => ( {
	value,
	error:
		! error && 60 < value.length
			? i18n.translate( "This field can't be longer than 60 characters." )
			: error,
} );

const validEmailCharacterField = ( { value, error }: userField ): userField => ( {
	value,
	error:
		! error && ! /^[0-9a-z_'-](\.?[0-9a-z_'-])*$/i.test( value )
			? i18n.translate(
					'Only number, letters, dashes, underscores, apostrophes and periods are allowed.'
			  )
			: error,
} );

const validateOverallEmail = (
	{ value: mailBox, error: mailBoxError }: userField,
	{ value: domain }: userField
): userField => ( {
	value: mailBox,
	error:
		! mailBoxError && ! emailValidator.validate( `${ mailBox }@${ domain }` )
			? i18n.translate( 'Please provide a valid email address.' )
			: mailBoxError,
} );

const validateOverallEmailAgainstExistingEmails = (
	{ value: mailBox, error: mailBoxError }: userField,
	{ value: domain }: userField,
	existingGSuiteUsers: any[]
): userField => ( {
	value: mailBox,
	error:
		! mailBoxError &&
		includes( mapValues( existingGSuiteUsers, 'email' ), `${ mailBox }@${ domain }` )
			? i18n.translate( 'You already have this email address.' )
			: mailBoxError,
} );

const validateUser = ( user: user ): user => {
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
	{ domain, mailBox, firstName, lastName }: user,
	existingGSuiteUsers: any[]
) => ( {
	firstName,
	lastName,
	domain,
	mailBox: validateOverallEmailAgainstExistingEmails( mailBox, domain, existingGSuiteUsers ),
} );

const newUser = ( domain: string = '' ): user => {
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
};

const newUsers = ( domain: string ): user[] => {
	return [ newUser( domain ) ];
};

const isUserComplete = ( user: user ): boolean => {
	return Object.values( user ).every( ( { value } ) => '' !== value );
};

const doesUserHaveError = ( user: user ): boolean => {
	return Object.values( user ).some( ( { error } ) => null !== error );
};

const userIsReady = ( user: user ): boolean =>
	isUserComplete( user ) && ! doesUserHaveError( user );

const transformUser = ( {
	firstName: { value: firstname },
	lastName: { value: lastname },
	domain: { value: domain },
	mailBox: { value: mailBox },
}: user ): googleAppsProductUser => ( {
	email: `${ mailBox }@${ domain }`.toLowerCase(),
	firstname,
	lastname,
} );

const getItemsForCart = ( domains: any[], productSlug: string, users: user[] ) => {
	const groups = mapValues( groupBy( users, 'domain.value' ), groupedUsers =>
		groupedUsers.map( transformUser )
	);

	return map( groups, ( groupedUsers, domain ) => {
		const domainInfo = find( domains, { name: domain } );

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
