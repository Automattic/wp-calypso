/**
 * @jest-environment jsdom
 */

import { queryClient } from '@automattic/api-queries';
import nock from 'nock';
import { agencyOverviewRoute } from '../agency';

const API_ROOT = 'https://public-api.wordpress.com';
const AGENCY_ID = 1234;

function runLoader() {
	const loader = agencyOverviewRoute.options.loader as unknown as () => Promise< void >;
	return loader();
}

describe( 'agencyOverviewRoute loader', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	it( 'resolves when the announcements request fails', async () => {
		nock( API_ROOT )
			.get( '/wpcom/v2/agency' )
			.query( true )
			.reply( 200, [ { id: AGENCY_ID } ] );
		nock( API_ROOT )
			.get( '/rest/v1.1/me/preferences' )
			.query( true )
			.reply( 200, { calypso_preferences: {} } );

		// 403 rather than 500: the shared query client retries 5xx three times
		// with backoff, which would need four intercepts and real waiting.
		const announcements = nock( API_ROOT )
			.get( `/wpcom/v2/agency/${ AGENCY_ID }/announcements` )
			.query( true )
			.reply( 403, { error: 'unauthorized', message: 'User cannot access this agency.' } );

		await expect( runLoader() ).resolves.toBeUndefined();

		expect( announcements.isDone() ).toBe( true );
	} );
} );
