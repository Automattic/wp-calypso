/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import nock from 'nock';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import {
	FIELD_FIRSTNAME,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
	FIELD_PASSWORD_RESET_EMAIL,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import {
	ExistingMailboxNamesValidator,
	MailboxNameValidator,
	MailboxNameAvailabilityValidator,
	MaximumStringLengthValidator,
	PasswordValidator,
	PasswordResetEmailValidator,
	RequiredValidator,
} from 'calypso/my-sites/email/form/mailboxes/validators';
import type {
	FieldError,
	FormFieldNames,
	GoogleFormFieldNames,
	MailboxFormFieldBase,
	TitanFormFieldNames,
} from 'calypso/my-sites/email/form/mailboxes/types';

type VisibleOrRequired = Partial<
	Pick< MailboxFormFieldBase< unknown >, 'isVisible' | 'isRequired' >
>;
type FieldValue = string | boolean | VisibleOrRequired | null;
type NonNullFieldError = Exclude< FieldError, null >;
type GoogleTestDataType = Partial< Record< GoogleFormFieldNames, FieldValue > >;
type TitanTestDataType = Partial< Record< TitanFormFieldNames, FieldValue > >;

const provideEmailProviderTestData = (
	provider: EmailProvider,
	title: string,
	existingMailboxNames: string[],
	fieldValueMap: Partial< Record< FormFieldNames, FieldValue > >,
	expectedFieldErrorMap: Partial< Record< FormFieldNames, NonNullFieldError > >
) => {
	return {
		provider,
		title: `${ provider }: ${ title }`,
		existingMailboxNames,
		fieldValueMap,
		expectedFieldErrorMap,
	};
};

const provideGoogleTestData = (
	title: string,
	fieldValueMap: GoogleTestDataType,
	expectedFieldErrorMap: Partial< Record< GoogleFormFieldNames, NonNullFieldError > > = {},
	existingMailboxNames: string[] = []
) =>
	provideEmailProviderTestData(
		EmailProvider.Google,
		title,
		existingMailboxNames,
		fieldValueMap,
		expectedFieldErrorMap
	);

const provideTitanTestData = (
	title: string,
	fieldValueMap: TitanTestDataType,
	expectedFieldErrorMap: Partial< Record< TitanFormFieldNames, NonNullFieldError > > = {},
	existingMailboxNames: string[] = []
) =>
	provideEmailProviderTestData(
		EmailProvider.Titan,
		title,
		existingMailboxNames,
		fieldValueMap,
		expectedFieldErrorMap
	);

const createTestDataForGoogle = ( overrides: GoogleTestDataType = {} ): GoogleTestDataType => {
	return {
		...{
			[ FIELD_FIRSTNAME ]: 'First',
			[ FIELD_LASTNAME ]: 'Last',
			[ FIELD_MAILBOX ]: 'info',
			[ FIELD_PASSWORD ]: 'some@password',
			[ FIELD_PASSWORD_RESET_EMAIL ]: 'recovery@email-test.com',
		},
		...overrides,
	};
};

const createTestDataForTitan = ( overrides: TitanTestDataType = {} ): TitanTestDataType => {
	return {
		...{
			[ FIELD_NAME ]: 'Name',
			[ FIELD_MAILBOX ]: 'info',
			[ FIELD_PASSWORD ]: '--password',
			[ FIELD_PASSWORD_RESET_EMAIL ]: 'email.000@gmail.com',
		},
		...overrides,
	};
};

const finalTestDataForAllCases = [
	provideGoogleTestData( 'Valid fields', createTestDataForGoogle() ),
	provideTitanTestData( 'Valid fields', createTestDataForTitan() ),
	provideGoogleTestData(
		'Empty value for the password field should fail validation',
		createTestDataForGoogle( { [ FIELD_PASSWORD ]: null } ),
		{ [ FIELD_PASSWORD ]: RequiredValidator.getRequiredFieldError() }
	),
	provideGoogleTestData(
		'Empty value for the recovery email field should fail validation',
		createTestDataForGoogle( { [ FIELD_PASSWORD_RESET_EMAIL ]: null } ),
		{ [ FIELD_PASSWORD_RESET_EMAIL ]: RequiredValidator.getRequiredFieldError() }
	),
	provideGoogleTestData(
		'Alternative email on the same domain should fail validation',
		createTestDataForGoogle( { [ FIELD_PASSWORD_RESET_EMAIL ]: 'email@example.com' } ),
		{
			[ FIELD_PASSWORD_RESET_EMAIL ]:
				PasswordResetEmailValidator.getSameDomainError( 'example.com' ),
		}
	),
	provideTitanTestData(
		'Empty value for the mailbox field should fail validation',
		createTestDataForTitan( { [ FIELD_MAILBOX ]: null } ),
		{ [ FIELD_MAILBOX ]: RequiredValidator.getRequiredFieldError() }
	),
	provideTitanTestData(
		'Empty value for the name field should fail validation',
		createTestDataForTitan( { [ FIELD_NAME ]: null } ),
		{ [ FIELD_NAME ]: RequiredValidator.getRequiredFieldError() }
	),
	provideTitanTestData(
		'Empty value for required but invisible fields (i.e. optional at provider, or generated later ) should pass',
		createTestDataForTitan( { [ FIELD_NAME ]: { isVisible: false } } )
	),
	provideGoogleTestData(
		'Fields with a maximum length bound should fail validation when the value is too long',
		createTestDataForGoogle( {
			[ FIELD_FIRSTNAME ]: 'j1gDpIBK7AQMiBqKFTQimlBakiGOKh23xkQyaDRxVuVEZCZLe1a0T4uVXXHCD',
		} ),
		{ [ FIELD_FIRSTNAME ]: MaximumStringLengthValidator.getFieldTooLongError( 60 ) }
	),
	provideGoogleTestData(
		'Existing mailboxes should fail validation',
		createTestDataForGoogle(),
		{
			[ FIELD_MAILBOX ]: ExistingMailboxNamesValidator.getExistingMailboxError(
				'example.com',
				'info'
			),
		},
		[ 'info' ]
	),
	provideTitanTestData(
		'Existing mailboxes should fail validation',
		createTestDataForTitan(),
		{
			[ FIELD_MAILBOX ]: ExistingMailboxNamesValidator.getExistingMailboxError(
				'example.com',
				'info'
			),
		},
		[ 'info' ]
	),
	provideGoogleTestData(
		'Mailbox names with invalid characters should fail validation',
		createTestDataForGoogle( {
			[ FIELD_MAILBOX ]: 'user @',
		} ),
		{
			[ FIELD_MAILBOX ]: MailboxNameValidator.getUnsupportedCharacterError( true ),
		}
	),
	provideTitanTestData(
		'Mailbox names with invalid characters should fail validation',
		createTestDataForTitan( {
			[ FIELD_MAILBOX ]: 'user¨" +',
		} ),
		{
			[ FIELD_MAILBOX ]: MailboxNameValidator.getUnsupportedCharacterError( false ),
		}
	),
	provideTitanTestData(
		'Invalid Alternative email should fail validation',
		createTestDataForTitan( { [ FIELD_PASSWORD_RESET_EMAIL ]: 'email@me-again@example.com' } ),
		{
			[ FIELD_PASSWORD_RESET_EMAIL ]: PasswordResetEmailValidator.getInvalidEmailError(),
		}
	),
	provideTitanTestData(
		'Alternative email on the same domain should fail validation',
		createTestDataForTitan( { [ FIELD_PASSWORD_RESET_EMAIL ]: 'email@example.com' } ),
		{
			[ FIELD_PASSWORD_RESET_EMAIL ]:
				PasswordResetEmailValidator.getSameDomainError( 'example.com' ),
		}
	),
	provideGoogleTestData(
		'Passwords must follow the approved pattern or fail validation (1). Too short.',
		createTestDataForGoogle( {
			[ FIELD_PASSWORD ]: 'some-passwo', // a character short
		} ),
		{
			[ FIELD_PASSWORD ]: PasswordValidator.getPasswordTooShortError( 12 ),
		}
	),
	provideTitanTestData(
		'Passwords must follow the approved pattern or fail validation (1). Too short.',
		createTestDataForTitan( {
			[ FIELD_PASSWORD ]: 'my-passw', // 2 characters short
		} ),
		{
			[ FIELD_PASSWORD ]: PasswordValidator.getPasswordTooShortError( 10 ),
		}
	),
	provideGoogleTestData(
		'Passwords must follow the approved pattern or fail validation (2). Too long.',
		createTestDataForGoogle( {
			[ FIELD_PASSWORD ]:
				'aqCmVMCbN8ECyK3MO0WPtnEM20B54utnpmzWIsZkz6THGpxy6nWMYqnVNrWcg1jKFNSh7RhUweBIcRlSGmyr9JIE6Di8rCcT9UJX4', // a character too long
		} ),
		{
			[ FIELD_PASSWORD ]: PasswordValidator.getPasswordTooLongError(),
		}
	),
	provideTitanTestData(
		'Passwords must follow the approved pattern or fail validation (2). Too long.',
		createTestDataForTitan( {
			[ FIELD_PASSWORD ]:
				'aqCmVMCbN8ECyK3MO0WPtnEM20B54utnpmzWIsZkz6THGpxy6nWMYqnVNrWcg1jKFNSh7RhUweBIcRlSGmyr9JIE6Di8rCcT9UJX4.', // 2 characters too long
		} ),
		{
			[ FIELD_PASSWORD ]: PasswordValidator.getPasswordTooLongError(),
		}
	),
	provideGoogleTestData(
		'Passwords must follow the approved pattern or fail validation (3). Leading space.',
		createTestDataForGoogle( {
			[ FIELD_PASSWORD ]: ' some-password',
		} ),
		{
			[ FIELD_PASSWORD ]: PasswordValidator.getPasswordStartsWithSpaceError(),
		}
	),
	provideTitanTestData(
		'Passwords must follow the approved pattern or fail validation (3). Leading space.',
		createTestDataForTitan( {
			[ FIELD_PASSWORD ]: '  my-password',
		} ),
		{
			[ FIELD_PASSWORD ]: PasswordValidator.getPasswordStartsWithSpaceError(),
		}
	),
	provideGoogleTestData(
		'Passwords must follow the approved pattern or fail validation (4). Trailing space.',
		createTestDataForGoogle( {
			[ FIELD_PASSWORD ]: 'some-password ',
		} ),
		{
			[ FIELD_PASSWORD ]: PasswordValidator.getPasswordEndsWithSpaceError(),
		}
	),
	provideTitanTestData(
		'Passwords must follow the approved pattern or fail validation (4). Trailing space.',
		createTestDataForTitan( {
			[ FIELD_PASSWORD ]: 'my-password  ',
		} ),
		{
			[ FIELD_PASSWORD ]: PasswordValidator.getPasswordEndsWithSpaceError(),
		}
	),
	provideGoogleTestData(
		'Passwords must follow the approved pattern or fail validation (5). Invalid character.',
		createTestDataForGoogle( {
			[ FIELD_PASSWORD ]: 'some-passwor₦d',
		} ),
		{
			[ FIELD_PASSWORD ]: PasswordValidator.getPasswordContainsForbiddenCharacterError( '₦' ),
		}
	),
	provideTitanTestData(
		'Passwords must follow the approved pattern or fail validation (5). Invalid character.',
		createTestDataForTitan( {
			[ FIELD_PASSWORD ]: 'my-₧assword  ',
		} ),
		{
			[ FIELD_PASSWORD ]: PasswordValidator.getPasswordContainsForbiddenCharacterError( '₧' ),
		}
	),
];

describe( 'Mailbox form validation', () => {
	it.each( finalTestDataForAllCases )(
		'$title',
		( { existingMailboxNames, provider, fieldValueMap, expectedFieldErrorMap } ) => {
			const mailboxForm = new MailboxForm( provider, 'example.com', existingMailboxNames );

			Object.keys( fieldValueMap ).forEach( ( key ) => {
				if ( Reflect.has( mailboxForm.formFields, key ) ) {
					let fieldValue = fieldValueMap[ key ];

					if ( fieldValue && typeof fieldValue === 'object' ) {
						if ( typeof fieldValue.isVisible === 'boolean' ) {
							mailboxForm.setFieldIsVisible( key as FormFieldNames, fieldValue.isVisible );
						}

						if ( typeof fieldValue.isRequired === 'boolean' ) {
							mailboxForm.setFieldIsRequired( key as FormFieldNames, fieldValue.isRequired );
						}

						if ( ! fieldValue.value ) {
							return;
						}

						fieldValue = fieldValue.value;
					}

					mailboxForm.setFieldValue( key as FormFieldNames, fieldValue );
				}
			} );

			mailboxForm.validate();

			Object.keys( expectedFieldErrorMap ).forEach( ( key ) => {
				if ( ! Reflect.has( mailboxForm.formFields, key ) ) {
					return;
				}

				expect( mailboxForm.getFieldError( key as FormFieldNames ) ).toEqual(
					expectedFieldErrorMap[ key ]
				);
			} );

			const fieldErrorMap = Object.fromEntries(
				Object.entries( mailboxForm.formFields )
					.filter( ( [ , field ] ) => Boolean( field.error ) )
					.map( ( [ key, field ] ) => [ key, field.error ] )
			);

			expect( fieldErrorMap ).toStrictEqual( expectedFieldErrorMap );
			expect( mailboxForm.hasErrors() ).toBe( Object.keys( expectedFieldErrorMap ).length > 0 );
		}
	);
} );

describe( 'Mailbox on demand form validation', () => {
	const finalTestDataForOnDemandCases = [
		provideGoogleTestData(
			'Availability tests for not-existing mailbox names should pass for Google',
			createTestDataForTitan( {
				[ FIELD_MAILBOX ]: 'not-existing',
			} ),
			{
				[ FIELD_MAILBOX ]: null,
			}
		),
		provideGoogleTestData(
			'Availability tests for existing mailbox names should pass for Google',
			createTestDataForTitan( {
				[ FIELD_MAILBOX ]: 'existing',
			} ),
			{
				[ FIELD_MAILBOX ]: null,
			}
		),
		provideTitanTestData(
			'Availability tests for not-existing mailbox names should pass for Titan',
			createTestDataForTitan( {
				[ FIELD_MAILBOX ]: 'not-existing',
			} ),
			{
				[ FIELD_MAILBOX ]: null,
			}
		),
		provideTitanTestData(
			'Availability tests for existing mailbox names should fail for Titan',
			createTestDataForTitan( {
				[ FIELD_MAILBOX ]: 'existing',
			} ),
			{
				[ FIELD_MAILBOX ]: MailboxNameAvailabilityValidator.getUnavailableMailboxError(
					'existing',
					'existing exists as email account'
				),
			}
		),
	];

	beforeAll( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( '/wpcom/v2/emails/titan/example.com/check-mailbox-availability/existing' )
			.reply( 409, { message: 'existing exists as email account' } )
			.get( '/wpcom/v2/emails/titan/example.com/check-mailbox-availability/not-existing' )
			.reply( 200, { message: 'OK' } );
	} );

	afterAll( () => {
		nock.cleanAll();
	} );

	it.each( finalTestDataForOnDemandCases )(
		'$title',
		async ( { provider, fieldValueMap, expectedFieldErrorMap } ) => {
			const mailboxForm = new MailboxForm( provider, 'example.com' );

			Object.keys( fieldValueMap ).forEach( ( key ) => {
				if ( Reflect.has( mailboxForm.formFields, key ) ) {
					let fieldValue = fieldValueMap[ key ];

					if ( fieldValue && typeof fieldValue === 'object' ) {
						if ( ! fieldValue.value ) {
							return;
						}

						fieldValue = fieldValue.value;
					}

					mailboxForm.setFieldValue( key as FormFieldNames, fieldValue );
				}
			} );

			await mailboxForm.validateOnDemand();

			Object.keys( expectedFieldErrorMap ).forEach( ( key ) => {
				if ( ! Reflect.has( mailboxForm.formFields, key ) ) {
					return;
				}

				expect( mailboxForm.getFieldError( key as FormFieldNames ) ).toEqual(
					expectedFieldErrorMap[ key ]
				);
			} );
		}
	);
} );
