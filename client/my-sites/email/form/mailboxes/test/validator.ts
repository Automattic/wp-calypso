/**
 * @jest-environment jsdom
 */

import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { EmailProvider, TitanMailboxFormFields } from 'calypso/my-sites/email/form/mailboxes/types';

describe( 'mailboxFormValidation', () => {
	it( 'should validate mailbox form correctly', () => {
		const mb = new MailboxForm( EmailProvider.Titan, 'example.com', [] );
		const formFields: TitanMailboxFormFields = mb.formFields;

		formFields.mailbox.value = 'user';
		formFields.alternativeEmail.value = 'user@test.com';
		formFields.password.value = 'v4l1dPassWord!';
		formFields.uuid.value = 'uniqueId';
		formFields.name.value = 'Letero';

		mb.validate();

		expect( formFields.mailbox.error ).toBeNull();
		expect( formFields.alternativeEmail.error ).toBeNull();
		expect( formFields.password.error ).toBeNull();
		expect( formFields.uuid.error ).toBeNull();
		expect( formFields.domain.error ).toBeNull();
	} );

	it( 'should fail validating alternative email', () => {
		const mb = new MailboxForm( EmailProvider.Titan, 'example.com', [] );
		const formFields: TitanMailboxFormFields = mb.formFields;

		formFields.alternativeEmail.value = 'sample@example.com';

		mb.validate();

		expect( formFields.alternativeEmail.error ).toBeTruthy();
	} );

	it( 'should fail validating existing mailboxes', () => {
		const mb = new MailboxForm( EmailProvider.Titan, 'example.com', [ 'user' ] );
		const formFields: TitanMailboxFormFields = mb.formFields;

		formFields.mailbox.value = 'user';

		mb.validate();

		expect( formFields.mailbox.error ).toBeTruthy();
	} );

	it( 'should fail validating alternative existing mailboxes with invalid characters', () => {
		const mb = new MailboxForm( EmailProvider.Titan, 'example.com', [] );
		const formFields: TitanMailboxFormFields = mb.formFields;

		formFields.mailbox.value = 'user ¨ +';

		mb.validate();

		expect( formFields.mailbox.error ).toBeTruthy();
	} );

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
