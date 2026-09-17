/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import { isRedirect } from '@tanstack/react-router';
import nock from 'nock';
import { agencySitesNeedSetupRoute } from '../agency';
import type { PendingAgencySite } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

type BeforeLoad = ( ctx: { cause: 'enter' | 'stay' | 'preload' } ) => Promise< void >;

function runBeforeLoad( cause: 'enter' | 'preload' = 'enter' ) {
	const beforeLoad = agencySitesNeedSetupRoute.options.beforeLoad as unknown as BeforeLoad;
	return beforeLoad( { cause } );
}

function pendingSite( id: number, state = 'pending' ): PendingAgencySite {
	return { id, features: { wpcom_atomic: { state, license_key: `license-${ id }` } } };
}

function mockAgencies( agencies: { id: number }[] ) {
	nock( API ).get( '/wpcom/v2/agency' ).reply( 200, agencies );
}

function mockPendingSites( pendingSites: PendingAgencySite[] ) {
	return nock( API ).get( '/wpcom/v2/agency/1/sites/pending' ).reply( 200, pendingSites );
}

async function getRedirectPath( promise: Promise< void > ) {
	const error = await promise.catch( ( thrown: unknown ) => thrown );
	return isRedirect( error ) ? error.to : undefined;
}

describe( 'agencySitesNeedSetupRoute beforeLoad', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	test( 'lets the screen load when a license is awaiting a site', async () => {
		mockAgencies( [ { id: 1 } ] );
		mockPendingSites( [ pendingSite( 1 ) ] );

		await expect( runBeforeLoad() ).resolves.toBeUndefined();
	} );

	test( 'redirects to /sites when no license is awaiting a site', async () => {
		mockAgencies( [ { id: 1 } ] );
		mockPendingSites( [ pendingSite( 1, 'provisioning' ) ] );

		expect( await getRedirectPath( runBeforeLoad() ) ).toBe( '/sites' );
	} );

	test( 'redirects to /sites when the user has no agency', async () => {
		mockAgencies( [] );
		const pendingSites = mockPendingSites( [ pendingSite( 1 ) ] );

		expect( await getRedirectPath( runBeforeLoad() ) ).toBe( '/sites' );
		expect( pendingSites.isDone() ).toBe( false );
	} );

	test( 'skips the check on preload', async () => {
		const agencies = nock( API ).get( '/wpcom/v2/agency' ).reply( 200, [] );

		await expect( runBeforeLoad( 'preload' ) ).resolves.toBeUndefined();
		expect( agencies.isDone() ).toBe( false );
	} );
} );
