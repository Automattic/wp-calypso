import { describe, expect, test, jest } from '@jest/globals';
import { Message } from 'mailosaur/lib/models';
import { EmailClient } from '../email-client';
import { SecretsManager, Secrets } from '../secrets';

const fakeSecrets = {
	testAccounts: {
		basicUser: {
			username: 'wpcomuser2',
			password: 'hunter2',
			primarySite: 'wpcomuser.wordpress.com/',
		},
	},
	mailosaur: {
		apiKey: 'fake_key',
		defaultUserInboxId: 'fake_id',
	},
} as unknown as Secrets;

jest.spyOn( SecretsManager, 'secrets', 'get' ).mockImplementation( () => fakeSecrets );

describe( 'EmailClient: get2FACodeFromMessage', function () {
	const createBaseSMSMessage = (): Partial< Message > => {
		return {
			id: 'fake_id',
			server: 'fake_server',
			from: [
				{
					phone: '18888888888',
				},
			],
			to: [
				{
					phone: '18887776666',
				},
			],
			received: new Date( Date.now() - 3600000 ),
			subject: 'SMS',
			text: {
				codes: [
					{
						value: '0123456',
					},
				],
				body: 'WordPress.com verification code: 0123456',
			},
		};
	};

	test( 'One code in message', function () {
		const emailClient = new EmailClient();

		const code = emailClient.get2FACodeFromMessage( createBaseSMSMessage() as Message );
		expect( code ).toBe( '0123456' );
	} );

	test( 'Two codes in message', function () {
		const message = createBaseSMSMessage() as Message;

		message.text?.codes?.push( {
			value: '4567890',
		} );

		const emailClient = new EmailClient();

		const code = emailClient.get2FACodeFromMessage( message );
		expect( code ).toBe( '0123456' );
	} );

	test( 'No codes in message', function () {
		const message = createBaseSMSMessage() as Message;

		message.text?.codes?.pop();

		const emailClient = new EmailClient();

		expect( () => {
			emailClient.get2FACodeFromMessage( message );
		} ).toThrow( 'Message has no OTP code.' );
	} );

	test( 'No text in message', function () {
		const message = createBaseSMSMessage() as Message;

		delete message.text;

		const emailClient = new EmailClient();

		expect( () => {
			emailClient.get2FACodeFromMessage( message );
		} ).toThrow( 'Message is not defined.' );
	} );
} );
