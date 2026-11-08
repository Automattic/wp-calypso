/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteActions from '../site-actions';
import type { Site } from '@automattic/api-core';

const siteId = 123;
const site = { ID: siteId, slug: 'example.com', is_wpcom_atomic: true } as Site;

function mockRestoreRequest( status = 200 ) {
	const requests = { count: 0, respond: () => {} };
	nock( 'https://public-api.wordpress.com' )
		.post( `/wpcom/v2/sites/${ siteId }/hosting/restore-plan-software` )
		.times( 2 )
		.reply( ( _uri, _body, callback ) => {
			requests.count++;
			requests.respond = () => callback( null, [ status, {} ] );
		} );
	return requests;
}

async function openDialog( user: UserEvent ) {
	render( <SiteActions site={ site } /> );
	await user.click( await screen.findByRole( 'button', { name: 'Restore' } ) );
	return within( await screen.findByRole( 'dialog', { name: 'Restore plugins and themes?' } ) );
}

function expectDialogClosed() {
	expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
}

describe( '<SiteActions>', () => {
	test( 'asks for confirmation before restoring plan software', async () => {
		const requests = mockRestoreRequest();

		const dialog = await openDialog( userEvent.setup() );

		expect( dialog.getByText( /Your active theme won’t change/ ) ).toBeVisible();
		expect( requests.count ).toBe( 0 );
	} );

	test( 'does not restore when the confirmation is cancelled', async () => {
		const user = userEvent.setup();
		const requests = mockRestoreRequest();

		const dialog = await openDialog( user );
		await user.click( dialog.getByRole( 'button', { name: 'Cancel' } ) );

		expectDialogClosed();
		expect( requests.count ).toBe( 0 );
	} );

	test( 'does not restore when the close button is activated with the keyboard', async () => {
		const user = userEvent.setup();
		const requests = mockRestoreRequest();

		const dialog = await openDialog( user );
		dialog.getByRole( 'button', { name: 'Close' } ).focus();
		await user.keyboard( '{Enter}' );

		await waitFor( expectDialogClosed );
		expect( requests.count ).toBe( 0 );
	} );

	test( 'sends one request and keeps the dialog busy until it finishes', async () => {
		const user = userEvent.setup();
		const requests = mockRestoreRequest();

		const dialog = await openDialog( user );
		await user.click( dialog.getByRole( 'button', { name: 'Restore' } ) );
		await waitFor( () => expect( requests.count ).toBe( 1 ) );

		expect( dialog.getByRole( 'button', { name: 'Restore' } ) ).toBeDisabled();

		requests.respond();
		await waitFor( expectDialogClosed );
	} );

	test( 'closes the dialog when the request fails', async () => {
		const user = userEvent.setup();
		const requests = mockRestoreRequest( 500 );

		const dialog = await openDialog( user );
		await user.click( dialog.getByRole( 'button', { name: 'Restore' } ) );
		await waitFor( () => expect( requests.count ).toBe( 1 ) );

		requests.respond();
		await waitFor( expectDialogClosed );
	} );

	test( 'does not offer the restore action on non-Atomic sites', async () => {
		render( <SiteActions site={ { ...site, is_wpcom_atomic: false } } /> );

		await waitFor( () => expect( screen.queryByTestId( 'loading' ) ).not.toBeInTheDocument() );
		expect( screen.queryByRole( 'button', { name: 'Restore' } ) ).not.toBeInTheDocument();
	} );
} );
