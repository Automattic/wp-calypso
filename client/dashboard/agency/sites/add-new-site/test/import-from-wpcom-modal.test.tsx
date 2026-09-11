/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import ImportFromWPCOMModal from '../import-from-wpcom-modal';

const BASE = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

function site( overrides: Record< string, unknown > ) {
	return {
		ID: 1,
		name: 'Example',
		URL: 'https://example.com',
		slug: 'example.com',
		is_wpcom_atomic: true,
		jetpack: false,
		is_wpcom_staging_site: false,
		site_migration: { in_progress: false, is_complete: false },
		options: { created_at: '2026-01-15T00:00:00+00:00' },
		...overrides,
	};
}

interface Options {
	sites?: Record< string, unknown >[];
	managedSites?: { blog_id: number }[];
}

function mockEndpoints( { sites = [ site( {} ) ], managedSites = [] }: Options = {} ) {
	nock( BASE )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID, approval_status: 'approved' } ] );

	nock( BASE ).get( '/rest/v1.2/me/sites' ).query( true ).reply( 200, { sites } );

	nock( BASE )
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( true )
		.times( 2 )
		.reply( 200, { sites: managedSites, total: managedSites.length } );

	const onClose = jest.fn();
	render( <ImportFromWPCOMModal onClose={ onClose } /> );

	return { onClose };
}

const addButton = () => screen.getByRole( 'button', { name: /^Add/ } );

afterEach( () => nock.cleanAll() );

describe( 'ImportFromWPCOMModal', () => {
	test( 'lists the sites the agency can still add', async () => {
		mockEndpoints( {
			sites: [
				site( { ID: 1, name: 'Atomic site' } ),
				site( { ID: 2, name: 'Jetpack site', is_wpcom_atomic: false, jetpack: true } ),
				site( { ID: 3, name: 'A4A site', is_wpcom_atomic: false, is_a4a_client: true } ),
			],
		} );

		expect( await screen.findByText( 'Atomic site' ) ).toBeVisible();
		expect( screen.getByText( 'Jetpack site' ) ).toBeVisible();
		expect( screen.getByText( 'A4A site' ) ).toBeVisible();
	} );

	test( 'names each site’s connection type', async () => {
		mockEndpoints( {
			sites: [
				site( { ID: 1, name: 'Atomic site' } ),
				site( { ID: 2, name: 'Jetpack site', is_wpcom_atomic: false, jetpack: true } ),
				site( { ID: 3, name: 'A4A site', is_wpcom_atomic: false, is_a4a_client: true } ),
			],
		} );

		await screen.findByText( 'Atomic site' );

		expect( screen.getByText( 'WordPress.com' ) ).toBeVisible();
		expect( screen.getByText( 'Jetpack' ) ).toBeVisible();
		expect( screen.getByText( 'Automattic for Agencies' ) ).toBeVisible();
	} );

	test( 'leaves out staging sites and sites the agency already manages', async () => {
		mockEndpoints( {
			sites: [
				site( { ID: 1, name: 'Importable' } ),
				site( { ID: 2, name: 'Staging', is_wpcom_staging_site: true } ),
				site( { ID: 3, name: 'Already managed' } ),
				site( { ID: 4, name: 'Not connected', is_wpcom_atomic: false } ),
			],
			managedSites: [ { blog_id: 3 } ],
		} );

		expect( await screen.findByText( 'Importable' ) ).toBeVisible();
		expect( screen.queryByText( 'Staging' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Already managed' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Not connected' ) ).not.toBeInTheDocument();
	} );

	test( 'blocks the add button until a site is selected', async () => {
		mockEndpoints();

		await screen.findByText( 'Example' );

		expect( addButton() ).toBeDisabled();
	} );

	test( 'imports the selected sites and closes', async () => {
		const { onClose } = mockEndpoints( {
			sites: [ site( { ID: 1, name: 'Example' } ), site( { ID: 2, name: 'Second' } ) ],
		} );
		const imported = nock( BASE )
			.post( `/wpcom/v2/agency/${ AGENCY_ID }/sites`, { blog_id: 1 } )
			.reply( 200, { success: true } );

		await screen.findByText( 'Example' );
		await userEvent.click( screen.getByRole( 'option', { name: /Example/ } ) );
		await userEvent.click( addButton() );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
		expect( imported.isDone() ).toBe( true );
	} );

	test( 'imports several sites at once', async () => {
		const { onClose } = mockEndpoints( {
			sites: [ site( { ID: 1, name: 'Alpha' } ), site( { ID: 2, name: 'Beta' } ) ],
		} );
		const first = nock( BASE )
			.post( `/wpcom/v2/agency/${ AGENCY_ID }/sites`, { blog_id: 1 } )
			.reply( 200, { success: true } );
		const second = nock( BASE )
			.post( `/wpcom/v2/agency/${ AGENCY_ID }/sites`, { blog_id: 2 } )
			.reply( 200, { success: true } );

		await screen.findByText( 'Alpha' );
		await userEvent.click( screen.getByRole( 'option', { name: /Alpha/ } ) );
		await userEvent.click( screen.getByRole( 'option', { name: /Beta/ } ) );

		expect( screen.getByRole( 'button', { name: 'Add 2 sites' } ) ).toBeEnabled();
		await userEvent.click( addButton() );

		await waitFor( () => expect( onClose ).toHaveBeenCalled() );
		expect( first.isDone() ).toBe( true );
		expect( second.isDone() ).toBe( true );
	} );

	test( 'selects every site at once', async () => {
		mockEndpoints( {
			sites: [ site( { ID: 1, name: 'Alpha' } ), site( { ID: 2, name: 'Beta' } ) ],
		} );

		await screen.findByText( 'Alpha' );
		await userEvent.click( screen.getByRole( 'checkbox', { name: 'Select all' } ) );

		expect( screen.getByRole( 'button', { name: 'Add 2 sites' } ) ).toBeEnabled();
	} );

	test( 'keeps the modal open when nothing could be imported', async () => {
		const { onClose } = mockEndpoints();
		nock( BASE ).post( `/wpcom/v2/agency/${ AGENCY_ID }/sites` ).reply( 500, { message: 'Nope' } );

		await screen.findByText( 'Example' );
		await userEvent.click( screen.getByRole( 'option', { name: /Example/ } ) );
		await userEvent.click( addButton() );

		await waitFor( () => expect( addButton() ).toBeEnabled() );
		expect( onClose ).not.toHaveBeenCalled();
	} );

	test( 'says so when there is nothing left to add', async () => {
		mockEndpoints( { sites: [ site( { ID: 1 } ) ], managedSites: [ { blog_id: 1 } ] } );

		expect( await screen.findByText( 'No sites to add' ) ).toBeVisible();
	} );
} );
