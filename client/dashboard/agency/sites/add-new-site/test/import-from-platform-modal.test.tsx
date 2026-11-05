/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
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

async function startImportAndCreateSite( session: { state: string; site_url: string } ) {
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
	nock( API )
		.get( `/wpcom/v2/static-site-import-session/${ SESSION_ID }` )
		.reply( 200, { session_id: SESSION_ID, ...session } );
	render( <ImportFromPlatformModal onClose={ jest.fn() } /> );
	const user = userEvent.setup();

	await user.type( screen.getByLabelText( 'Current site address' ), 'https://example.wixsite.com' );
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

	return user;
}

describe( '<ImportFromPlatformModal>', () => {
	afterEach( () => {
		nock.cleanAll();
		getProvisioningSiteIds().forEach( untrackProvisioningSite );
	} );

	test( 'provisions a dev site that holds the import and follows it until it is ready', async () => {
		await startImportAndCreateSite( {
			state: 'finished',
			site_url: 'https://ramblingthoughts.wpcomstaging.com/',
		} );

		expect( await screen.findByText( 'Your site is ready to review' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Review the site' } ) ).toHaveAttribute(
			'href',
			'https://ramblingthoughts.wpcomstaging.com/'
		);
	} );

	test( 'offers to start again when the import fails on the dev site', async () => {
		const user = await startImportAndCreateSite( { state: 'failed', site_url: '' } );

		await user.click( await screen.findByRole( 'button', { name: 'Start again' } ) );

		// Back at the address, kept so the same site can be retried.
		expect( screen.getByLabelText( 'Current site address' ) ).toHaveValue(
			'https://example.wixsite.com'
		);
		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeEnabled();
	} );
} );
