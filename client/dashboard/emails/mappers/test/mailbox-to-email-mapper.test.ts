import { EmailProvider } from '@automattic/api-core';
import { mapMailboxToEmail } from '../mailbox-to-email-mapper';
import type { EmailAccount, EmailBox } from '@automattic/api-core';

const box: EmailBox = {
	mailbox: 'info',
	domain: 'example.com',
	email_type: 'email',
	role: 'standard',
	warnings: [],
};

const account: EmailAccount = {
	account_type: EmailProvider.Titan,
	account_id: 1,
	product_slug: 'wp_titan_mail_yearly',
	maximum_mailboxes: 1,
	subscription_id: 1,
	domains: [],
	warnings: [],
	emails: [ box ],
	status: 'active',
	can_user_add_email: true,
};

const domainNotConnected = {
	warning_type: 'error',
	warning_slug: 'domain_not_connected',
	message: 'Domain not connected',
};

const mxRecordsMissing = {
	warning_type: 'error',
	warning_slug: 'mx_records_missing',
	message: 'MX records missing',
};

describe( 'mapMailboxToEmail', () => {
	test( 'uses the status of a warning', () => {
		const email = mapMailboxToEmail( box, { ...account, warnings: [ domainNotConnected ] } );

		expect( email.status ).toBe( 'domain_not_connected' );
	} );

	test( 'uses the MX records missing status before the domain not connected status', () => {
		const email = mapMailboxToEmail( box, {
			...account,
			warnings: [ domainNotConnected, mxRecordsMissing ],
		} );

		expect( email.status ).toBe( 'mx_records_missing' );
	} );

	test( 'keeps the pending deletion status of a mailbox when the account has a warning', () => {
		const email = mapMailboxToEmail(
			{ ...box, status: 'pending_deletion' },
			{ ...account, warnings: [ domainNotConnected ] }
		);

		expect( email.status ).toBe( 'pending_deletion' );
	} );
} );
