/**
 * @jest-environment jsdom
 */

import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_FIRSTNAME,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import {
	AlternateEmailValidator,
	ExistingMailboxNamesValidator,
	MailboxNameValidator,
} from 'calypso/my-sites/email/form/mailboxes/validators';
import type {
	FieldError,
	FormFieldNames,
	GoogleFormFieldNames,
	MailboxFormFieldBase,
	TitanFormFieldNames,
	TitanMailboxFormFields,
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
		},
		...overrides,
	};
};

const createTestDataForTitan = ( overrides: TitanTestDataType = {} ): TitanTestDataType => {
	return {
		...{
			[ FIELD_ALTERNATIVE_EMAIL ]: 'email.000@gmail.com',
			[ FIELD_NAME ]: 'Name',
			[ FIELD_MAILBOX ]: 'info',
			[ FIELD_PASSWORD ]: '--password',
		},
		...overrides,
	};
};

const finalTestDataForAllCases = [
	provideGoogleTestData( 'Valid fields', createTestDataForGoogle() ),
	provideTitanTestData( 'Valid fields', createTestDataForTitan() ),
	provideGoogleTestData(
		'Existing mailboxes should fail validation',
		createTestDataForGoogle(),
		{
			[ FIELD_MAILBOX ]: ExistingMailboxNamesValidator.getExistingMailboxError(),
		},
		[ 'info' ]
	),
	provideTitanTestData(
		'Existing mailboxes should fail validation',
		createTestDataForTitan(),
		{
			[ FIELD_MAILBOX ]: ExistingMailboxNamesValidator.getExistingMailboxError(),
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
		'Alternative email on the same domain should fail validation',
		createTestDataForTitan( { [ FIELD_ALTERNATIVE_EMAIL ]: 'email@example.com' } ),
		{
			[ FIELD_ALTERNATIVE_EMAIL ]: AlternateEmailValidator.getSameDomainError( 'example.com' ),
		}
	),
	provideGoogleTestData(
		'Passwords must follow the approved pattern or fail validation',
		createTestDataForGoogle( {
			[ FIELD_PASSWORD ]: 'some-passwo', // a character short
		} ),
		{
			[ FIELD_PASSWORD ]: MailboxNameValidator.getUnsupportedCharacterError( true ),
		}
	),
	provideTitanTestData(
		'Passwords must follow the approved pattern or fail validation',
		createTestDataForTitan( {
			[ FIELD_PASSWORD ]: 'my-passw', // 2 characters short
		} ),
		{
			[ FIELD_PASSWORD ]: MailboxNameValidator.getUnsupportedCharacterError( false ),
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

					if ( typeof fieldValue === 'object' ) {
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

					const field = Reflect.get( mailboxForm.formFields, key );
					Reflect.set( field, 'value', fieldValue );
				}
			} );

			mailboxForm.validate();

			Object.keys( expectedFieldErrorMap ).forEach( ( key ) => {
				if ( ! Reflect.has( mailboxForm.formFields, key ) ) {
					return;
				}

				const field = Reflect.get( mailboxForm.formFields, key );
				expect( field.error ).toEqual( expectedFieldErrorMap[ key ] );
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

describe( 'mailboxFormValidation', () => {
	it( 'should fail validating password', () => {
		const mb = new MailboxForm( EmailProvider.Titan, 'example.com', [] );
		const formFields: TitanMailboxFormFields = mb.formFields;

		formFields.password.value = 'test';

		mb.validate();

		expect( formFields.password.error ).toBeTruthy();
	} );

	it( 'should fail validating required fields', () => {
		const mb = new MailboxForm( EmailProvider.Titan, null, [] );
		const formFields: TitanMailboxFormFields = mb.formFields;

		mb.validate();

		expect( formFields.password.error ).toBeTruthy();
		expect( formFields.domain.error ).toBeTruthy();
		expect( formFields.mailbox.error ).toBeTruthy();
	} );
} );
