/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { isSameDay, usePersistentVisitCounter } from '../use-visit-counter';

const DAY_IN_MS = 86400000;

function createWrapper() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
}

function mockGetPreferences( preferences: Record< string, unknown > ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: preferences } );
}

function mockUpdatePreferences( matchCount: number ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences', ( body ) => {
			const counter = body?.calypso_preferences?.[ 'hosting-dashboard-visit-count-deployments' ];
			return counter?.count === matchCount && typeof counter?.lastUpdated === 'number';
		} )
		.reply( 200, { calypso_preferences: {} } );
}

describe( 'isSameDay', () => {
	test( 'is true for two timestamps in the same UTC day', () => {
		const base = 5 * DAY_IN_MS;
		expect( isSameDay( base, base + 1000 ) ).toBe( true );
	} );

	test( 'is false for timestamps on different days', () => {
		const base = 5 * DAY_IN_MS;
		expect( isSameDay( base, base + DAY_IN_MS ) ).toBe( false );
	} );
} );

describe( 'usePersistentVisitCounter', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'increments to 1 on the first visit of a fresh day', async () => {
		mockGetPreferences( {} );
		const update = mockUpdatePreferences( 1 );

		renderHook( () => usePersistentVisitCounter( 'deployments' ), { wrapper: createWrapper() } );

		await waitFor( () => expect( update.isDone() ).toBe( true ) );
	} );

	test( 'increments from an existing count when last visit was a previous day', async () => {
		mockGetPreferences( {
			'hosting-dashboard-visit-count-deployments': {
				count: 3,
				lastUpdated: Date.now() - 2 * DAY_IN_MS,
			},
		} );
		const update = mockUpdatePreferences( 4 );

		renderHook( () => usePersistentVisitCounter( 'deployments' ), { wrapper: createWrapper() } );

		await waitFor( () => expect( update.isDone() ).toBe( true ) );
	} );

	test( 'does not increment when already counted today', async () => {
		const get = mockGetPreferences( {
			'hosting-dashboard-visit-count-deployments': {
				count: 3,
				lastUpdated: Date.now(),
			},
		} );
		// Any POST at all would count as a wrongful increment.
		const update = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: {} } );

		renderHook( () => usePersistentVisitCounter( 'deployments' ), { wrapper: createWrapper() } );

		await waitFor( () => expect( get.isDone() ).toBe( true ) );
		await act( () => new Promise( ( resolve ) => setTimeout( resolve, 20 ) ) );

		expect( update.isDone() ).toBe( false );
	} );

	test( 'does nothing when area is null', async () => {
		const update = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: {} } );

		renderHook( () => usePersistentVisitCounter( null ), { wrapper: createWrapper() } );

		await act( () => new Promise( ( resolve ) => setTimeout( resolve, 20 ) ) );

		expect( update.isDone() ).toBe( false );
	} );
} );
