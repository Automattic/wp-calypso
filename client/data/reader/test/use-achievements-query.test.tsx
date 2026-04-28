/**
 * @jest-environment jsdom
 */
import { isEnabled } from '@automattic/calypso-config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wpcom from 'calypso/lib/wp';
import { useAchievementsQuery } from '../use-achievements-query';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

const mockIsEnabled = isEnabled as jest.MockedFunction< typeof isEnabled >;
const mockGet = jest.mocked( wpcom.req.get );

describe( 'useAchievementsQuery', () => {
	let queryClient: QueryClient;
	let wrapper: React.FC< React.PropsWithChildren< unknown > >;

	beforeEach( () => {
		jest.clearAllMocks();
		mockIsEnabled.mockReturnValue( true );

		queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );
		wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	test( 'should not fire a request when feature flag is disabled', () => {
		mockIsEnabled.mockReturnValue( false );

		renderHook( () => useAchievementsQuery( 'testuser' ), { wrapper } );

		expect( mockGet ).not.toHaveBeenCalled();
	} );

	test( 'should not fire a request when userIdOrLogin is undefined', () => {
		renderHook( () => useAchievementsQuery( undefined ), { wrapper } );

		expect( mockGet ).not.toHaveBeenCalled();
	} );

	test( 'should fetch the achievements endpoint with the right path', async () => {
		mockGet.mockResolvedValue( { found: 0, achievements: [] } );

		const { result } = renderHook( () => useAchievementsQuery( 'testuser' ), { wrapper } );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( mockGet ).toHaveBeenCalledWith(
			expect.objectContaining( {
				path: '/read/achievements/testuser',
				apiNamespace: 'wpcom/v2',
			} ),
			{ number: 100, page: 1 }
		);
	} );

	test( 'should expose yearsOfService from the first page', async () => {
		mockGet.mockResolvedValue( {
			found: 1,
			achievements: [ { achievement_id: 1 } ],
			years_of_service: 7,
		} );

		const { result } = renderHook( () => useAchievementsQuery( 'testuser' ), { wrapper } );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( result.current.yearsOfService ).toBe( 7 );
	} );

	test( 'should expose achievements flattened across fetched pages', async () => {
		mockGet
			.mockResolvedValueOnce( {
				found: 3,
				achievements: [ { achievement_id: 1 } ],
			} )
			.mockResolvedValueOnce( {
				found: 3,
				achievements: [ { achievement_id: 2 }, { achievement_id: 3 } ],
			} );

		const { result } = renderHook( () => useAchievementsQuery( 'testuser' ), { wrapper } );

		await waitFor( () => expect( result.current.achievements ).toHaveLength( 1 ) );
		expect( result.current.hasNextPage ).toBe( true );

		await result.current.fetchNextPage();

		await waitFor( () => expect( result.current.achievements ).toHaveLength( 3 ) );
		expect( result.current.found ).toBe( 3 );
		expect( result.current.hasNextPage ).toBe( false );
	} );

	test( 'should return undefined yearsOfService when not in response', async () => {
		mockGet.mockResolvedValue( { found: 0, achievements: [] } );

		const { result } = renderHook( () => useAchievementsQuery( 'testuser' ), { wrapper } );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( result.current.yearsOfService ).toBeUndefined();
	} );
} );
