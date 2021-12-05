import { Button, Gridicon } from '@automattic/components';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import classNames from 'classnames';
import emailValidator from 'email-validator';
import { translate, TranslateResult, useRtl, useTranslate } from 'i18n-calypso';
import { countBy, find, groupBy, includes, map, mapValues } from 'lodash';
import React, { ChangeEvent, Fragment, FunctionComponent, ReactNode, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { googleApps, googleAppsExtraLicenses } from 'calypso/lib/cart-values/cart-items';
import {
	getGSuiteMailboxCount,
	hasGSuiteWithUs,
	isGoogleWorkspaceProductSlug,
	isGSuiteProductSlug,
} from 'calypso/lib/gsuite';
import { GSuiteNewUser, GSuiteProductUser } from 'calypso/lib/gsuite/new-users';

import './style.scss';

export const GENERIC_EMAIL_FORM_EMAIL_FIELD = 'email';
export const GENERIC_EMAIL_FORM_FULL_NAME_FIELD = 'fullName';
export const GENERIC_EMAIL_FORM_FIRST_NAME_FIELD = 'firstName';
export const GENERIC_EMAIL_FORM_LAST_NAME_FIELD = 'lastName';
export const GENERIC_EMAIL_FORM_IS_ADMIN_FIELD = 'isAdmin';
export const GENERIC_EMAIL_FORM_ALTERNATIVE_EMAIL_FIELD = 'alternativeEmail';

const requiredField = ( { value, error }: GenericNewUserField ): GenericNewUserField => ( {
	value,
	error:
		! error && ( ! value || '' === value.trim() ) ? translate( 'This field is required.' ) : error,
} );

/*
 * Adds a new error if the mailbox has no errors and the email address is invalid.
 */
const validateEmail = ( {
	value: alternativeEmail,
	error: alternativeEmailError,
}: GenericNewUserField ): GenericNewUserField => ( {
	value: alternativeEmail,
	error:
		! alternativeEmailError && ! emailValidator.validate( alternativeEmail )
			? translate( 'Please provide a valid email address.' )
			: alternativeEmailError,
} );

/*
 * Adds a new error if the mailbox has no errors and the email address is invalid.
 */
const validateOverallEmail = (
	{ value: mailBox, error: mailBoxError }: GenericNewUserField,
	{ value: domain }: GenericNewUserField
): GenericNewUserField => ( {
	value: mailBox,
	error:
		! mailBoxError && ! emailValidator.validate( `${ mailBox }@${ domain }` )
			? translate( 'Please provide a valid email address.' )
			: mailBoxError,
} );

/**
 * Retrieves the specified user after applying a callback to all of its fields.
 *
 * @param {object} user - user with a list of fields
 * @param {Array} optionalFields - list of optional fields (not required fields)
 * @param {Function} callback - function to call for each field
 */
const mapFieldValues = (
	user: GenericNewUser,
	optionalFields: string[],
	callback: any
): GenericNewUser =>
	mapValues( user, ( fieldValue, fieldName ) => {
		if ( 'uuid' === fieldName || optionalFields.some( ( field: string ) => field === fieldName ) ) {
			return fieldValue;
		}

		return callback( fieldValue, fieldName, user );
	} );

/*
 * Adds a new error to the specified email field if it has no errors and contains invalid characters.
 */
const validEmailCharacterField = ( {
	value,
	error,
}: GenericNewUserField ): GenericNewUserField => ( {
	value,
	error:
		! error && ! /^[0-9a-z_'-](\.?[0-9a-z_'-])*$/i.test( value )
			? translate(
					'Only numbers, letters, dashes, underscores, apostrophes and periods are allowed.'
			  )
			: error,
} );

/*
 * Adds a new error to the specified field if it has no errors and is more than sixty characters.
 */
const sixtyCharacterField = ( { value, error }: GenericNewUserField ): GenericNewUserField => ( {
	value,
	error:
		! error && 60 < value.length
			? translate( "This field can't be longer than %s characters.", {
					args: '60',
			  } )
			: error,
} );

/*
 * Adds a new error if the specified mailbox field has no errors and appears more than once in the provided map.
 */
const validateNewUserMailboxIsUnique = (
	{ value: mailBox, error: previousError }: GenericNewUserField,
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
const validateNewUsersAreUnique = ( users: GenericNewUser[] ): GenericNewUser[] => {
	const mailboxesByCount: { [ mailbox: string ]: number } = countBy(
		users.map( ( { mailBox: { value: mailBox } } ) => mailBox )
	);

	return users.map(
		( {
			uuid,
			alternativeEmail,
			fullName,
			email,
			domain,
			isAdmin,
			mailBox,
			firstName,
			lastName,
			password,
		} ) => ( {
			uuid,
			alternativeEmail,
			email,
			firstName,
			fullName,
			lastName,
			domain,
			isAdmin,
			mailBox: validateNewUserMailboxIsUnique( mailBox, mailboxesByCount ),
			password,
		} )
	);
};

/*
 * Validates the specified password field.
 *
 * @see https://support.google.com/accounts/answer/32040 for requirements
 */
export const validatePasswordField = (
	{ value, error }: GenericNewUserField,
	minimumLength = 12
): GenericNewUserField => {
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
const validateUser = ( user: GenericNewUser, optoinalFields: string[] ): GenericNewUser => {
	const {
		alternativeEmail,
		domain,
		email,
		fullName,
		isAdmin,
		mailBox,
		firstName,
		lastName,
		password,
	} = mapFieldValues( user, optoinalFields, ( field: GenericNewUserField ) =>
		requiredField( field )
	);

	return {
		uuid: user.uuid,
		alternativeEmail: validateEmail( alternativeEmail ),
		domain,
		isAdmin,
		fullName,
		mailBox: validateOverallEmail( validEmailCharacterField( mailBox ), domain ),
		firstName: sixtyCharacterField( firstName ),
		lastName: sixtyCharacterField( lastName ),
		password: validatePasswordField( password ),
		email,
	};
};

/**
 * Sanitizes the specified email address by removing any character that is not allowed, and converting it to lowercase.
 *
 * @param {string} email - email address
 */
export const sanitizeEmail = ( email: string ): string =>
	email.replace( /[^0-9a-z_'.-]/gi, '' ).toLowerCase();

/*
 * Clears all previous errors from the specified field.
 */
const removePreviousErrors = ( { value }: GenericNewUserField ): GenericNewUserField => ( {
	value,
	error: null,
} );

/*
 * Clears all previous errors from all fields for the specified user.
 */
const clearPreviousErrors = ( users: GenericNewUser[] ): GenericNewUser[] => {
	return users.map( ( user ) =>
		mapFieldValues( user, [], ( field: GenericNewUserField ) => removePreviousErrors( field ) )
	);
};

/*
 * Run a full validation on all users
 */
const validateUsers = (
	users: GenericNewUser[],
	extraValidation: ( user: GenericNewUser ) => GenericNewUser = ( user ) => user,
	optionalFields: string[]
): GenericNewUser[] => {
	// 1. scrub all previous errors with clearPreviousErrors
	// 2. first check for uniqueness with validateNewUsersAreUnique
	// 3. then run the standard validateUser on each user
	// 4. finally run extraValidation on each user
	return validateNewUsersAreUnique( clearPreviousErrors( users ) )
		.map( ( user ) => validateUser( user, optionalFields ) )
		.map( extraValidation );
};

/*
 * Adds a new error if the mailbox has no errors and matches an existing email address.
 */
const validateOverallEmailAgainstExistingEmails = (
	{ value: mailBox, error: mailBoxError }: GenericNewUserField,
	{ value: domain }: GenericNewUserField,
	existingGenericUsers: [  ]
): GenericNewUserField => ( {
	value: mailBox,
	error:
		! mailBoxError &&
		includes(
			mapValues( existingGenericUsers, GENERIC_EMAIL_FORM_EMAIL_FIELD ),
			`${ mailBox }@${ domain }`
		)
			? translate( 'You already have this email address.' )
			: mailBoxError,
} );

export const validateAgainstExistingUsers = (
	{
		uuid,
		alternativeEmail,
		domain,
		email,
		isAdmin,
		mailBox,
		firstName,
		fullName,
		lastName,
		password,
	}: GenericNewUser,
	existingGSuiteUsers: [  ]
): GenericNewUser => ( {
	uuid,
	alternativeEmail,
	firstName,
	fullName,
	lastName,
	domain,
	isAdmin,
	email,
	mailBox: validateOverallEmailAgainstExistingEmails( mailBox, domain, existingGSuiteUsers ),
	password,
} );

const newField = ( value = '' ): GenericNewUserField => ( {
	value,
	error: null,
} );

/**
 * Retrieves all fields from the specified user.
 *
 * @param {object} user - user with a list of fields
 */
const getFields = ( user: GenericNewUser, optionalFields: string[] = [] ): GenericNewUserField[] =>
	Object.keys( user )
		.filter( ( key ) => 'uuid' !== key && ! optionalFields.some( ( field ) => field === key ) )
		.map( ( key ) => user[ key ] );

const isUserComplete = ( user: GenericNewUser, optionalFields: string[] ): boolean => {
	return getFields( user, optionalFields ).every( ( { value } ) => '' !== value );
};

const doesUserHaveError = ( user: GenericNewUser ): boolean => {
	return getFields( user ).some( ( { error } ) => null !== error );
};

/**
 * Returns if a user is ready to be added as a new email aka valid
 *
 * @param user user to check
 * @returns boolean if the user is valid or not
 */
export const isUserValid = ( user: GenericNewUser, optionalFields: string[] ): boolean =>
	isUserComplete( user, optionalFields ) && ! doesUserHaveError( user );

export const areAllUsersValid = (
	users: GenericNewUser[],
	optionalFields: string[] = []
): boolean => 0 < users.length && users.every( ( user ) => isUserValid( user, optionalFields ) );

export const newUser = ( domain = '' ): GenericNewUser => {
	return {
		uuid: uuidv4(),
		alternativeEmail: newField(),
		firstName: newField(),
		fullName: newField(),
		isAdmin: newField(),
		lastName: newField(),
		mailBox: newField(),
		domain: newField( domain ),
		email: newField(),
		password: newField(),
	};
};

export interface GenericNewUserField {
	value: string;
	error: TranslateResult | null;
}

export interface GenericNewUser {
	uuid: string;
	alternativeEmail: GenericNewUserField;
	domain: GenericNewUserField;
	email: GenericNewUserField;
	mailBox: GenericNewUserField;
	firstName: GenericNewUserField;
	lastName: GenericNewUserField;
	password: GenericNewUserField;
	fullName: GenericNewUserField;
	isAdmin: GenericNewUserField;
}

interface LabelWrapperProps {
	label: TranslateResult;
}

const LabelWrapper: FunctionComponent< LabelWrapperProps > = ( { label, children } ) => {
	return (
		<FormLabel>
			{ label }
			{ children }
		</FormLabel>
	);
};

interface DomainSelectProps {
	domains: string[];
	onChange: ( event: ChangeEvent< HTMLInputElement > ) => void;
	value: string;
}

const DomainsSelect = ( { domains, onChange, value }: DomainSelectProps ) => {
	return (
		<FormSelect
			className="email-provider-generic-form__domain-select"
			onChange={ onChange }
			value={ value }
		>
			{ domains.map( ( domain ) => {
				return (
					<option value={ domain } key={ domain }>
						@{ domain }
					</option>
				);
			} ) }
		</FormSelect>
	);
};

interface GenericNewUserProps {
	autoFocus: boolean;
	domains: any;
	hiddenFields: string[];
	onUserRemove: () => void;
	onUserValueChange: ( field: string, value: string ) => void;
	onReturnKeyPress: ( event: Event ) => void;
	selectedDomainName: string;
	showTrashButton: boolean;
	user: GenericNewUser;
}

const GenericNewUser: FunctionComponent< GenericNewUserProps > = ( {
	autoFocus,
	domains,
	hiddenFields = [],
	onUserRemove,
	onUserValueChange,
	onReturnKeyPress,
	user: {
		alternativeEmail: { value: alternativeEmail, error: alternativeEmailError },
		firstName: { value: firstName, error: firstNameError },
		fullName: { value: fullName, error: fullNameError },
		lastName: { value: lastName, error: lastNameError },
		mailBox: { value: mailBox, error: mailBoxError },
		domain: { error: domainError },
		password: { value: password, error: passwordError },
	},
	selectedDomainName,
	showTrashButton = true,
} ) => {
	const translate = useTranslate();
	const isRtl = useRtl();

	// use this to control setting the "touched" states below. That way the user will not see a bunch of
	// "This field is required" errors pop at once
	const wasValidated =
		[ firstName, fullName, lastName, mailBox, password ].some( ( value ) => '' !== value ) ||
		[ firstNameError, lastNameError, mailBoxError, passwordError, domainError ].some(
			( value ) => null !== value
		);

	const [ alternativeEmailFieldTouched, setAlternativeEmailFieldTouched ] = useState( false );
	const [ firstNameFieldTouched, setFirstNameFieldTouched ] = useState( false );
	const [ fullNameFieldTouched, setFullNameFieldTouched ] = useState( false );
	const [ lastNameFieldTouched, setLastNameFieldTouched ] = useState( false );
	const [ mailBoxFieldTouched, setMailBoxFieldTouched ] = useState( false );
	const [ passwordFieldTouched, setPasswordFieldTouched ] = useState( false );

	const hasAlternativeEmailError = alternativeEmailFieldTouched && null !== alternativeEmailError;
	const hasMailBoxError = mailBoxFieldTouched && null !== mailBoxError;
	const hasFirstNameError = firstNameFieldTouched && null !== firstNameError;
	const hasFullNameError = fullNameFieldTouched && null !== fullNameError;
	const hasLastNameError = lastNameFieldTouched && null !== lastNameError;
	const hasPasswordError = passwordFieldTouched && null !== passwordError;

	const emailAddressLabel = translate( 'Email address' );

	const renderSingleDomain = () => {
		return (
			<LabelWrapper label={ emailAddressLabel }>
				<FormTextInputWithAffixes
					value={ mailBox }
					isError={ hasMailBoxError }
					onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
						onUserValueChange( 'mailBox', event.target.value.toLowerCase() );
					} }
					onBlur={ () => {
						setMailBoxFieldTouched( wasValidated );
					} }
					onKeyUp={ onReturnKeyPress }
					prefix={ isRtl ? `\u200e@${ selectedDomainName }\u202c` : null }
					suffix={ isRtl ? null : `\u200e@${ selectedDomainName }\u202c` }
				/>
			</LabelWrapper>
		);
	};

	const renderMultiDomain = () => {
		return (
			<LabelWrapper label={ emailAddressLabel }>
				<div className="email-provider-generic-form__multi-container">
					<FormTextInput
						value={ mailBox }
						isError={ hasMailBoxError }
						onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
							onUserValueChange( 'mailBox', event.target.value.toLowerCase() );
						} }
						onBlur={ () => {
							setMailBoxFieldTouched( wasValidated );
						} }
						onKeyUp={ onReturnKeyPress }
					/>

					<DomainsSelect
						domains={ domains }
						onChange={ ( event ) => {
							onUserValueChange( 'domain', event.target.value );
						} }
						value={ selectedDomainName }
					/>
				</div>
			</LabelWrapper>
		);
	};

	return (
		<div className={ classNames( 'email-provider-generic-form__new-user' ) }>
			<FormFieldset className="email-provider-generic-form__form-fieldset">
				{ ! hiddenFields.some( ( field ) => field === GENERIC_EMAIL_FORM_FULL_NAME_FIELD ) && (
					<div className="email-provider-generic-form__new-user-name-container">
						<LabelWrapper label={ translate( 'Full name' ) }>
							<FormTextInput
								autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
								value={ firstName }
								maxLength={ 60 }
								isError={ hasFullNameError }
								onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
									onUserValueChange( GENERIC_EMAIL_FORM_FULL_NAME_FIELD, event.target.value );
								} }
								onBlur={ () => {
									setFullNameFieldTouched( wasValidated );
								} }
								onKeyUp={ onReturnKeyPress }
							/>
						</LabelWrapper>

						{ hasFirstNameError && <FormInputValidation text={ firstNameError } isError /> }
					</div>
				) }

				{ ! hiddenFields.some( ( field ) => field === GENERIC_EMAIL_FORM_FIRST_NAME_FIELD ) && (
					<div className="email-provider-generic-form__new-user-name-container">
						<LabelWrapper label={ translate( 'First name' ) }>
							<FormTextInput
								autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
								value={ firstName }
								maxLength={ 60 }
								isError={ hasFirstNameError }
								onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
									onUserValueChange( GENERIC_EMAIL_FORM_FIRST_NAME_FIELD, event.target.value );
								} }
								onBlur={ () => {
									setFirstNameFieldTouched( wasValidated );
								} }
								onKeyUp={ onReturnKeyPress }
							/>
						</LabelWrapper>

						{ hasFirstNameError && <FormInputValidation text={ firstNameError } isError /> }
					</div>
				) }

				<div className="email-provider-generic-form__new-user-name-container">
					{ ! hiddenFields.some( ( field ) => field === GENERIC_EMAIL_FORM_LAST_NAME_FIELD ) && (
						<LabelWrapper label={ translate( 'Last name' ) }>
							<FormTextInput
								value={ lastName }
								maxLength={ 60 }
								isError={ hasLastNameError }
								onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
									onUserValueChange( GENERIC_EMAIL_FORM_LAST_NAME_FIELD, event.target.value );
								} }
								onBlur={ () => {
									setLastNameFieldTouched( wasValidated );
								} }
								onKeyUp={ onReturnKeyPress }
							/>
						</LabelWrapper>
					) }

					{ hasLastNameError && <FormInputValidation text={ lastNameError } isError /> }
				</div>
			</FormFieldset>

			{ ! hiddenFields.some(
				( field ) => field === GENERIC_EMAIL_FORM_ALTERNATIVE_EMAIL_FIELD
			) && (
				<FormFieldset className="email-provider-generic-form__form-fieldset">
					<div className="email-provider-generic-form__new-user-name-container">
						<LabelWrapper
							label={ translate( 'Password reset email address', {
								comment: 'This is the email address we will send password reset emails to',
							} ) }
						>
							<FormTextInput
								value={ alternativeEmail }
								isError={ hasAlternativeEmailError }
								onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
									onUserValueChange(
										GENERIC_EMAIL_FORM_ALTERNATIVE_EMAIL_FIELD,
										event.target.value
									);
								} }
								onBlur={ () => {
									setAlternativeEmailFieldTouched( wasValidated );
								} }
								onKeyUp={ onReturnKeyPress }
							/>
						</LabelWrapper>
						{ hasAlternativeEmailError && (
							<FormInputValidation text={ alternativeEmailError } isError />
						) }
					</div>
				</FormFieldset>
			) }

			<FormFieldset className="email-provider-generic-form__form-fieldset">
				<div className="email-provider-generic-form__new-user-email-container">
					<div className="email-provider-generic-form__new-user-email">
						{ domains.length > 1 ? renderMultiDomain() : renderSingleDomain() }
					</div>

					{ hasMailBoxError && <FormInputValidation text={ mailBoxError } isError /> }
				</div>

				<div className="email-provider-generic-form__new-user-password-container">
					<LabelWrapper label={ translate( 'Password' ) }>
						<FormPasswordInput
							autoCapitalize="off"
							autoCorrect="off"
							value={ password }
							maxLength={ 100 }
							isError={ hasPasswordError }
							onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
								onUserValueChange( 'password', event.target.value );
							} }
							onBlur={ () => {
								setPasswordFieldTouched( wasValidated );
							} }
							onKeyUp={ onReturnKeyPress }
						/>
					</LabelWrapper>

					{ hasPasswordError && <FormInputValidation text={ passwordError } isError /> }
				</div>
				{ showTrashButton && (
					<Button
						className="email-provider-generic-form__new-user-remove-user-button"
						onClick={ onUserRemove }
					>
						<Gridicon icon="trash" />
						<span>{ translate( 'Remove this mailbox' ) }</span>
					</Button>
				) }
			</FormFieldset>
		</div>
	);
};

interface EmailProviderGenericFormProps {
	autoFocus?: boolean;
	children?: ReactNode;
	domains?: any;
	extraValidation: ( user: GenericNewUser ) => GenericNewUser;
	selectedDomainName: string;
	setValidForm: ( valid: boolean ) => void;
	showAddAnotherMailboxButton: boolean;
	onUsersChange: ( users: GenericNewUser[] ) => void;
	onReturnKeyPress: ( event: Event ) => void;
	hiddenFields: string[];
	users: GenericNewUser[];
}

export const EmailProviderGenericForm: FunctionComponent< EmailProviderGenericFormProps > = ( {
	autoFocus = false,
	children,
	domains,
	extraValidation,
	onUsersChange,
	onReturnKeyPress,
	hiddenFields = [],
	selectedDomainName,
	setValidForm,
	showAddAnotherMailboxButton = true,
	users,
} ) => {
	const translate = useTranslate();

	const onUserValueChange = ( uuid: string ) => (
		fieldName: string,
		fieldValue: string,
		mailBoxFieldTouched = false
	) => {
		const changedUsers = users.map( ( user ) => {
			if ( user.uuid !== uuid ) {
				return user;
			}

			const changedUser = { ...user, [ fieldName ]: { value: fieldValue, error: null } };

			if ( GENERIC_EMAIL_FORM_FIRST_NAME_FIELD === fieldName && ! mailBoxFieldTouched ) {
				return { ...changedUser, mailBox: { value: sanitizeEmail( fieldValue ), error: null } };
			}

			return changedUser;
		} );

		onUsersChange( validateUsers( changedUsers, extraValidation, hiddenFields ) );
		setValidForm( areAllUsersValid( users, hiddenFields ) );
	};

	const onUserAdd = () => {
		onUsersChange( [ ...users, newUser( selectedDomainName ) ] );
	};

	const onUserRemove = ( uuid: string ) => () => {
		const newUserList = users.filter( ( _user ) => _user.uuid !== uuid );

		onUsersChange( 0 < newUserList.length ? newUserList : [ newUser( selectedDomainName ) ] );
	};

	return (
		<div>
			{ users.map( ( user, index ) => (
				<Fragment key={ user.uuid }>
					<GenericNewUser
						autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
						domains={
							domains ? domains.map( ( domain: any ) => domain.name ) : [ selectedDomainName ]
						}
						hiddenFields={ hiddenFields }
						user={ user }
						onUserValueChange={ onUserValueChange( user.uuid ) }
						onUserRemove={ onUserRemove( user.uuid ) }
						onReturnKeyPress={ onReturnKeyPress }
						selectedDomainName={ selectedDomainName }
						showTrashButton={ index > 0 }
					/>

					<hr className="email-provider-generic-form__user-divider" />
				</Fragment>
			) ) }

			{ showAddAnotherMailboxButton && (
				<div className="email-provider-generic-form__add-another-user-container">
					{ /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus */ }
					<span
						role="button"
						className="email-provider-generic-form__add-another-user-button"
						onClick={ onUserAdd }
					>
						<Gridicon icon="plus" />
						{ translate( 'Add an extra mailbox' ) }
					</span>
					<hr className="email-provider-generic-form__user-divider" />
				</div>
			) }

			<div className="email-provider-generic-form__actions">{ children }</div>
		</div>
	);
};

export const transformGenericUserFromTitanMailboxForCart = ( genericNewUser: GenericNewUser ) => ( {
	alternative_email: genericNewUser.alternativeEmail?.value,
	email: `${ genericNewUser.mailBox?.value }@${ genericNewUser.domain?.value }`,
	is_admin: genericNewUser.isAdmin?.value,
	name: genericNewUser.fullName?.value ?? genericNewUser.firstName?.value,
	password: genericNewUser.password?.value,
} );

const transformGenericUserFromGoogleWorkspaceMailboxForCart = ( {
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

const mapGoogleCartItem = (
	groupedUsers: GSuiteProductUser[],
	domainName: string,
	productSlug: string,
	domains: { name: string }[]
) => {
	const properties = { domain: domainName, users: groupedUsers };

	const domain = find( domains, [ 'name', domainName ] );

	const isExtraLicense = domain && hasGSuiteWithUs( domain );

	if ( isGSuiteProductSlug( productSlug ) && isExtraLicense ) {
		return googleAppsExtraLicenses( properties );
	}

	if ( isGoogleWorkspaceProductSlug( productSlug ) && isExtraLicense ) {
		properties[ 'new_quantity' ] = groupedUsers.length;
		properties[ 'quantity' ] = getGSuiteMailboxCount( domain ) + groupedUsers.length;
	}

	if ( isGoogleWorkspaceProductSlug( productSlug ) && ! isExtraLicense ) {
		properties[ 'quantity' ] = groupedUsers.length;
	}
	return googleApps( { ...properties, product_slug: productSlug } );
};

export const getItemsFromGoogleWorkspaceForCart = (
	domains: { name: string }[],
	productSlug: string,
	users: GSuiteNewUser[]
): MinimalRequestCartProduct => {
	const usersGroupedByDomain: { [ domain: string ]: GSuiteProductUser[] } = mapValues(
		groupBy( users, 'domain.value' ),
		( groupedUsers ) => groupedUsers.map( transformGenericUserFromGoogleWorkspaceMailboxForCart )
	);

	return map( usersGroupedByDomain, ( groupedUsers, domainName ) =>
		mapGoogleCartItem( groupedUsers, domainName, productSlug, domains )
	);
};
