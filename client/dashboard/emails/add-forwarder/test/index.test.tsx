/**
 * @jest-environment jsdom
 */
import { EmailProvider } from '@automattic/api-core';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AddEmailForwarder from '../index';
import type { EmailAccount } from '@automattic/api-core';

const DOMAIN = 'example.com';

function mockApi() {
	// Eligible forwarding domain so the form renders.
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1/me/mailboxes' )
		.query( true )
		.reply( 200, [
			{
				account_type: EmailProvider.Forwarding,
				can_user_add_email: true,
				domains: [ { domain: DOMAIN } ],
			},
		] as EmailAccount[] );

	// Existing forwarders for the eligible domain (queried on render).
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/domains/${ DOMAIN }/email` )
		.query( true )
		.reply( 200, { forwards: [], max_forwards: 100 } )
		.persist();
}

describe( '<AddEmailForwarder>', () => {
	// DOTMSD-1342
	test( 'keeps Save disabled and shows a required-fields hint for an empty form', async () => {
		mockApi();
		render( <AddEmailForwarder /> );

		// The form renders once the eligible domain loads.
		expect( await screen.findByLabelText( 'Forward to' ) ).toBeVisible();

		expect( screen.getByText( /add at least one forwarding address to continue/i ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
	} );

	// DOTMSD-1342
	test( 'rejects an invalid email in the Forward to field', async () => {
		mockApi();
		const user = userEvent.setup();
		render( <AddEmailForwarder /> );

		const forwardTo = await screen.findByLabelText( 'Forward to' );
		await user.type( forwardTo, 'notanemail{Enter}' );

		// A malformed value is not tokenized, so the verification notice never appears.
		expect(
			screen.queryByText( /set up an email forwarder to notanemail/i )
		).not.toBeInTheDocument();
		// Instead, an inline error explains the input is invalid.
		expect( screen.getByText( 'Please enter a valid email address.' ) ).toBeVisible();
		// The Save button stays disabled because there is no valid forwarding address.
		expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
	} );

	// DOTMSD-1342
	test( 'accepts multiple valid forwarding addresses', async () => {
		mockApi();
		const user = userEvent.setup();
		render( <AddEmailForwarder /> );

		const forwardTo = await screen.findByLabelText( 'Forward to' );
		await user.type( forwardTo, 'first@example.com{Enter}second@example.com{Enter}' );

		expect( screen.getByText( 'first@example.com' ) ).toBeVisible();
		expect( screen.getByText( 'second@example.com' ) ).toBeVisible();
		expect( screen.queryByText( 'Please enter a valid email address.' ) ).not.toBeInTheDocument();
	} );
} );
