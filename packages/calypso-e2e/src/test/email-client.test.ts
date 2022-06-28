import { describe, expect, test } from '@jest/globals';
import { EmailClient } from '../email-client';

describe( 'EmailClient: get2FACodeFromMessage', function () {
	const baseSMSMessage = {
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

	test( 'One code in message', function () {
		const emailClient = new EmailClient();

		const code = emailClient.get2FACodeFromMessage( baseSMSMessage );
		expect( code ).toBe( '0123456' );
	} );

	test( 'Two codes in message', function () {
		const message = JSON.parse( JSON.stringify( baseSMSMessage ) );

		message.text.codes.push( {
			value: '4567890',
		} );

		const emailClient = new EmailClient();

		const code = emailClient.get2FACodeFromMessage( message );
		expect( code ).toBe( '0123456' );
	} );

	test( 'No codes in message', function () {
		const message = JSON.parse( JSON.stringify( baseSMSMessage ) );

		message.text.codes.pop();

		const emailClient = new EmailClient();

		expect( () => {
			emailClient.get2FACodeFromMessage( message );
		} ).toThrow( 'Message has no OTP code.' );
	} );

	test( 'No text in message', function () {
		const message = JSON.parse( JSON.stringify( baseSMSMessage ) );

		delete message[ 'text' ];

		const emailClient = new EmailClient();

		expect( () => {
			emailClient.get2FACodeFromMessage( message );
		} ).toThrow( 'Message is not defined.' );
	} );
} );
