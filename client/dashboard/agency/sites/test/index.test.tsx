/**
 * @jest-environment jsdom
 */
import { pendingAgencySitesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import AgencySites from '../index';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

function pendingSite( id: number, state: string, licenseKey = 'wpcom-hosting-business_abc' ) {
	return { id, features: { wpcom_atomic: { license_key: licenseKey, state } } };
}

function mockPage( pendingSites: unknown[] ) {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID } ] )
		.persist();
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.persist();
	nock( API )
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( true )
		.reply( 200, { sites: [], total: 0 } )
		.persist();
	nock( API )
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/sites/pending` )
		.reply( 200, pendingSites )
		.persist();
}

describe( '<AgencySites>', () => {
	test( 'points licenses waiting to be set up at the unassigned Purchases filter', async () => {
		mockPage( [ pendingSite( 7, 'pending' ), pendingSite( 8, 'pending', 'wpcom-hosting-x_def' ) ] );

		render( <AgencySites /> );

		expect(
			await screen.findByText( /2 WordPress\.com licenses are ready to set up/ )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Set them up in Purchases' } ) ).toHaveAttribute(
			'href',
			'/marketplace/purchases?status=unassigned&search=WordPress.com'
		);
	} );

	// The header counts on every /sites load, so it must not take the route down
	// when the endpoint answers with something other than the expected list.
	test( 'survives a response that is not a list of pending sites', async () => {
		mockPage( { error: 'unauthorized' } as unknown as unknown[] );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		render( <AgencySites />, { queryClient } );

		// Assert against the cache rather than the screen: the header renders
		// before the payload lands, so waiting on it would pass either way.
		await waitFor( () =>
			expect( queryClient.getQueryData( pendingAgencySitesQuery( AGENCY_ID ).queryKey ) ).toEqual( {
				error: 'unauthorized',
			} )
		);

		expect( screen.getByRole( 'heading', { name: 'Sites' } ) ).toBeVisible();
		expect( screen.queryByText( /ready to set up/ ) ).not.toBeInTheDocument();
	} );

	test( 'says nothing when every license already has its site', async () => {
		mockPage( [ pendingSite( 7, 'provisioning' ) ] );

		render( <AgencySites /> );

		await screen.findByRole( 'heading', { name: 'Sites' } );
		expect( screen.queryByText( /ready to set up/ ) ).not.toBeInTheDocument();
	} );
} );
