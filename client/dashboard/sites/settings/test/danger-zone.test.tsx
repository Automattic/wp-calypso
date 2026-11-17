/**
 * @vitest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { useState } from 'react';
import { vi } from 'vitest';
import Snackbars from '../../../app/snackbars';
import { render } from '../../../test-utils';
import DangerZone from '../danger-zone';
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
	render( <DangerZone site={ site } /> );
	await user.click( await screen.findByRole( 'button', { name: 'Restore' } ) );
	return within( await screen.findByRole( 'dialog', { name: 'Restore plugins and themes?' } ) );
}

function expectDialogClosed() {
	expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
}

describe( '<DangerZone>', () => {
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
		expect( dialog.getByRole( 'button', { name: 'Cancel' } ) ).toBeDisabled();

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
		render( <DangerZone site={ { ...site, is_wpcom_atomic: false } } /> );

		await waitFor( () => expect( screen.queryByTestId( 'loading' ) ).not.toBeInTheDocument() );
		expect( screen.queryByRole( 'button', { name: 'Restore' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not offer the restore action on staging sites', async () => {
		render( <DangerZone site={ { ...site, is_wpcom_staging_site: true } } /> );

		await waitFor( () => expect( screen.queryByTestId( 'loading' ) ).not.toBeInTheDocument() );
		expect( screen.queryByRole( 'button', { name: 'Restore' } ) ).not.toBeInTheDocument();
	} );
} );

describe( '<DangerZone> restore feedback', () => {
	const confirmation =
		'Restoration requested. The plugins and themes included with your plan should be restored within a few minutes.';

	function getSnackbars( text: string ) {
		return screen.queryAllByText( text, { selector: '.components-snackbar__content' } );
	}

	async function confirmRestore( user: UserEvent ) {
		await user.click( await screen.findByRole( 'button', { name: 'Restore' } ) );
		const dialog = within(
			await screen.findByRole( 'dialog', { name: 'Restore plugins and themes?' } )
		);
		await user.click( dialog.getByRole( 'button', { name: 'Restore' } ) );
	}

	beforeEach( () => {
		vi.spyOn( window, 'scrollTo' ).mockImplementation( () => {} );
		dispatch( noticesStore ).removeNotices(
			select( noticesStore )
				.getNotices()
				.map( ( notice ) => notice.id )
		);
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	test( 'marks the action as requested once the request is accepted', async () => {
		const user = userEvent.setup();
		const requests = mockRestoreRequest();
		render(
			<>
				<DangerZone site={ site } />
				<Snackbars />
			</>
		);

		await confirmRestore( user );
		await waitFor( () => expect( requests.count ).toBe( 1 ) );
		requests.respond();

		const requested = await screen.findByRole( 'button', { name: 'Requested' } );
		expect( requested ).toBeDisabled();
		await waitFor( () => expect( getSnackbars( confirmation ) ).toHaveLength( 1 ) );

		await user.click( requested );
		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( requests.count ).toBe( 1 );
	} );

	test( 'lets the restore be retried after a failed request', async () => {
		const user = userEvent.setup();
		const requests = mockRestoreRequest( 500 );
		render(
			<>
				<DangerZone site={ site } />
				<Snackbars />
			</>
		);

		await confirmRestore( user );
		await waitFor( () => expect( requests.count ).toBe( 1 ) );
		requests.respond();

		await waitFor( () =>
			expect(
				getSnackbars( 'Failed to request restoration of plan plugin and themes.' )
			).toHaveLength( 1 )
		);
		expect( screen.getByRole( 'button', { name: 'Restore' } ) ).toBeEnabled();

		await confirmRestore( user );
		await waitFor( () => expect( requests.count ).toBe( 2 ) );
	} );

	test( 'starts with an enabled Restore button when Settings is reopened', async () => {
		const user = userEvent.setup();
		const requests = mockRestoreRequest();
		const firstVisit = render( <DangerZone site={ site } /> );

		await confirmRestore( user );
		await waitFor( () => expect( requests.count ).toBe( 1 ) );
		requests.respond();
		await screen.findByRole( 'button', { name: 'Requested' } );
		firstVisit.unmount();

		render( <DangerZone site={ site } /> );
		expect( await screen.findByRole( 'button', { name: 'Restore' } ) ).toBeEnabled();
	} );

	test( 'resets the requested state when switching to another site', async () => {
		function SiteSwitcher() {
			const [ selectedSite, setSelectedSite ] = useState( site );
			return (
				<>
					<button onClick={ () => setSelectedSite( { ...site, ID: 456 } ) }>Switch site</button>
					<DangerZone site={ selectedSite } />
				</>
			);
		}
		const user = userEvent.setup();
		const requests = mockRestoreRequest();
		render( <SiteSwitcher /> );

		await confirmRestore( user );
		await waitFor( () => expect( requests.count ).toBe( 1 ) );
		requests.respond();
		await screen.findByRole( 'button', { name: 'Requested' } );

		await user.click( screen.getByRole( 'button', { name: 'Switch site' } ) );
		expect( await screen.findByRole( 'button', { name: 'Restore' } ) ).toBeEnabled();
	} );
} );
