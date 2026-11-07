/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { shouldLoadSurvicate, setSurvicateVisitorTraits } from '@automattic/survicate';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import nock from 'nock';
import { vi } from 'vitest';
import { AuthContext } from '../../auth';
import { useSurvicateVisitTraits } from '../index';
import type { User } from '@automattic/api-core';

vi.mock( '@automattic/calypso-config', () => {
	const fn = vi.fn();
	return { ...Object.assign( fn, { __esModule: true, default: fn, isEnabled: vi.fn() } ) };
} );

vi.mock( '@automattic/survicate', () => ( {
	shouldLoadSurvicate: vi.fn(),
	setSurvicateVisitorTraits: vi.fn(),
} ) );

vi.mock( '@wordpress/compose', async () => ( {
	...( await vi.importActual< typeof import( '@wordpress/compose' ) >( '@wordpress/compose' ) ),
	useViewportMatch: vi.fn(),
} ) );

const mockedConfig = vi.mocked( config );
const mockedShouldLoad = vi.mocked( shouldLoadSurvicate );
const mockedSetTraits = vi.mocked( setSurvicateVisitorTraits );
const mockedUseViewportMatch = vi.mocked( useViewportMatch );

const user = { ID: 1, email: 'test@example.com', language: 'en' } as User;

function mockGetPreferences( preferences: Record< string, unknown > ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: preferences } );
}

function renderTraitsHook() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return renderHook( () => useSurvicateVisitTraits(), {
		wrapper: ( { children } ) => (
			<QueryClientProvider client={ queryClient }>
				<AuthContext.Provider value={ { user, logout: vi.fn() } }>
					{ children }
				</AuthContext.Provider>
			</QueryClientProvider>
		),
	} );
}

describe( 'useSurvicateVisitTraits', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		mockedSetTraits.mockReturnValue( vi.fn() );
		mockedConfig.mockReturnValue( true );
		mockedShouldLoad.mockReturnValue( true );
		mockedUseViewportMatch.mockReturnValue( false );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'pushes a trait per area with a positive count', async () => {
		mockGetPreferences( {
			'hosting-dashboard-visit-count-deployments': { count: 5, lastUpdated: 1 },
			'hosting-dashboard-visit-count-domains': { count: 2, lastUpdated: 1 },
		} );

		renderTraitsHook();

		await waitFor( () =>
			expect( mockedSetTraits ).toHaveBeenCalledWith( {
				msd_visits_deployments: 5,
				msd_visits_domains: 2,
			} )
		);
	} );

	test( 'skips areas with a zero count', async () => {
		mockGetPreferences( {
			'hosting-dashboard-visit-count-deployments': { count: 0, lastUpdated: 1 },
			'hosting-dashboard-visit-count-domains': { count: 3, lastUpdated: 1 },
		} );

		renderTraitsHook();

		await waitFor( () =>
			expect( mockedSetTraits ).toHaveBeenCalledWith( { msd_visits_domains: 3 } )
		);
		expect( mockedSetTraits ).not.toHaveBeenCalledWith(
			expect.objectContaining( { msd_visits_deployments: expect.anything() } )
		);
	} );

	test( 'does not push when there are no visited areas', async () => {
		mockGetPreferences( {} );

		renderTraitsHook();

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		expect( mockedSetTraits ).not.toHaveBeenCalled();
	} );

	test( 'does not push when Survicate is disabled', async () => {
		mockedConfig.mockReturnValue( false );
		mockGetPreferences( {
			'hosting-dashboard-visit-count-deployments': { count: 5, lastUpdated: 1 },
		} );

		renderTraitsHook();

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		expect( mockedSetTraits ).not.toHaveBeenCalled();
	} );

	test( 'does not push when the locale/mobile gate fails', async () => {
		mockedShouldLoad.mockReturnValue( false );
		mockGetPreferences( {
			'hosting-dashboard-visit-count-deployments': { count: 5, lastUpdated: 1 },
		} );

		renderTraitsHook();

		await waitFor( () => expect( nock.isDone() ).toBe( true ) );
		expect( mockedSetTraits ).not.toHaveBeenCalled();
	} );
} );
