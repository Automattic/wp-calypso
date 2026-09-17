/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { shouldLoadSurvicate, setSurvicateVisitorTraits } from '@automattic/survicate';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useViewportMatch } from '@wordpress/compose';
import nock from 'nock';
import { AuthContext } from '../../auth';
import { useSurvicateVisitTraits } from '../index';
import type { User } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn();
	return Object.assign( fn, { __esModule: true, default: fn, isEnabled: jest.fn() } );
} );

jest.mock( '@automattic/survicate', () => ( {
	shouldLoadSurvicate: jest.fn(),
	setSurvicateVisitorTraits: jest.fn(),
} ) );

jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useViewportMatch: jest.fn(),
} ) );

const mockedConfig = jest.mocked( config );
const mockedShouldLoad = jest.mocked( shouldLoadSurvicate );
const mockedSetTraits = jest.mocked( setSurvicateVisitorTraits );
const mockedUseViewportMatch = jest.mocked( useViewportMatch );

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
				<AuthContext.Provider value={ { user, logout: jest.fn() } }>
					{ children }
				</AuthContext.Provider>
			</QueryClientProvider>
		),
	} );
}

describe( 'useSurvicateVisitTraits', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockedSetTraits.mockReturnValue( jest.fn() );
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
