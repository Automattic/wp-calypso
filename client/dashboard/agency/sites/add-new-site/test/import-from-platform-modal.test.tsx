/**
 * @vitest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../../test-utils';
import { getProvisioningSiteIds, untrackProvisioningSite } from '../../../sites/provisioning-sites';
import ImportFromPlatformModal from '../import-from-platform-modal';

const API = 'https://public-api.wordpress.com';
const SESSION_ID = 'a'.repeat( 32 );

function mockAgencyAndAddress() {
	nock( API )
		.persist()
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 1 } ] );
	nock( API )
		.persist()
		.get( '/wpcom/v2/site-suggestions' )
		.reply( 200, { suggestions: [ { title: 'Rambling Thoughts' } ] } );
	nock( API )
		.persist()
		.get( '/rest/v1.1/domains/suggestions' )
		.query( true )
		.reply( 200, [ { domain_name: 'ramblingthoughts.wordpress.com' } ] );
}

async function startImportAndCreateSite( sessionReply: [ number, Record< string, string > ] ) {
	mockAgencyAndAddress();
	const create = nock( API )
		.post( '/wpcom/v2/static-site-import-session', { source_url: 'https://example.wixsite.com' } )
		.reply( 200, { session_id: SESSION_ID, state: 'capture_queued' } );
	const provision = nock( API )
		.post( '/wpcom/v2/agency/1/sites/provision-dev-site', ( body ) => {
			expect( body ).toMatchObject( {
				site_name: 'ramblingthoughts',
				import_session_id: SESSION_ID,
			} );
			return true;
		} )
		.reply( 200, { site: { id: 456 }, license: {}, provision: {} } );
	const sessionRead = nock( API )
		.get( `/wpcom/v2/static-site-import-session/${ SESSION_ID }` )
		.reply( ...sessionReply );
	render( <ImportFromPlatformModal onClose={ vi.fn() } /> );
	const user = userEvent.setup();

	await user.type( screen.getByLabelText( 'Current site address' ), 'example.wixsite.com' );
	await user.click( screen.getByRole( 'button', { name: 'Continue' } ) );
	await waitFor( () => expect( create.isDone() ).toBe( true ) );
	// The suggested address settles through a debounce before Create site enables.
	await waitFor( () =>
		expect( screen.getByLabelText( 'Site address' ) ).toHaveValue( 'ramblingthoughts' )
	);
	await waitFor( () =>
		expect( screen.getByRole( 'button', { name: 'Create site' } ) ).toBeEnabled()
	);
	await user.click( screen.getByRole( 'button', { name: 'Create site' } ) );
	await waitFor( () => expect( provision.isDone() ).toBe( true ) );

	return { user, sessionRead };
}

describe( '<ImportFromPlatformModal>', () => {
	afterEach( () => {
		getProvisioningSiteIds().forEach( untrackProvisioningSite );
	} );

	test( 'provisions a dev site that holds the import and follows it until it is ready', async () => {
		await startImportAndCreateSite( [
			200,
			{
				session_id: SESSION_ID,
				state: 'finished',
				site_url: 'https://ramblingthoughts.wpcomstaging.com/',
			},
		] );

		// The ready state is mounted from the start and only unhidden once the session settles.
		await waitFor( () =>
			expect( screen.getByText( 'Your site is ready to review' ) ).toBeVisible()
		);
		expect( screen.getByRole( 'link', { name: 'Review the site' } ) ).toHaveAttribute(
			'href',
			'https://ramblingthoughts.wpcomstaging.com/'
		);
	} );

	test( 'offers to start again when the import fails on the dev site', async () => {
		const { user } = await startImportAndCreateSite( [
			200,
			{ session_id: SESSION_ID, state: 'failed', site_url: '' },
		] );

		await user.click( await screen.findByRole( 'button', { name: 'Start again' } ) );

		// Back at the address, kept so the same site can be retried.
		expect( screen.getByLabelText( 'Current site address' ) ).toHaveValue( 'example.wixsite.com' );
		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeEnabled();
	} );

	test( 'keeps the move running when reading the session hits a server error', async () => {
		const { sessionRead } = await startImportAndCreateSite( [
			500,
			{ code: 'internal_server_error', message: 'Oops' },
		] );
		await waitFor( () => expect( sessionRead.isDone() ).toBe( true ) );

		expect( screen.getByText( 'Moving your site…' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Start again' } ) ).not.toBeInTheDocument();
	} );
} );
