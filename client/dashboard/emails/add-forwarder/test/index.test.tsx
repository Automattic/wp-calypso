/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import AddEmailForwarder from '../index';
import type { DomainSummary } from '@automattic/api-core';

const DOMAIN = 'example.com';

function mockApi( { domains }: { domains?: DomainSummary[] } = {} ) {
	// Eligible forwarding domain so the form renders.
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, {
			domains: domains ?? [
				{
					domain: DOMAIN,
					subtype: { id: 'domain_registration', label: 'Domain Registration' },
					current_user_is_owner: true,
				} as DomainSummary,
			],
		} );

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

	// DOTMSD-1477
	test( 'offers a domain the user administers but does not own', async () => {
		mockApi( {
			domains: [
				{
					domain: DOMAIN,
					subtype: { id: 'domain_registration', label: 'Domain Registration' },
					current_user_is_owner: false,
				} as DomainSummary,
			],
		} );
		render( <AddEmailForwarder /> );

		expect( await screen.findByLabelText( 'Forward to' ) ).toBeVisible();
		expect( screen.getByRole( 'option', { name: DOMAIN } ) ).toBeInTheDocument();
		expect(
			screen.queryByText( 'You do not have any domains eligible for email forwarding.' )
		).not.toBeInTheDocument();
	} );

	test( 'keeps the empty state when the user only has a default address', async () => {
		mockApi( {
			domains: [
				{
					domain: 'example.wordpress.com',
					subtype: { id: 'default_address', label: 'Default Address' },
					current_user_is_owner: true,
				} as DomainSummary,
			],
		} );
		render( <AddEmailForwarder /> );

		expect(
			await screen.findByText( 'You do not have any domains eligible for email forwarding.' )
		).toBeVisible();
	} );
} );
