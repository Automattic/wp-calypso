/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useMcpTracksAudienceProps } from '../tracks';

let mockEnvId = 'production';
let mockIsAutomattician = true;

jest.mock( '@automattic/calypso-config', () => {
	const config = jest.fn( ( key ) => ( key === 'env_id' ? mockEnvId : null ) );
	config.isEnabled = jest.fn( () => true );
	return config;
} );

jest.mock( '@automattic/api-queries', () => ( {
	isAutomatticianQuery: () => ( {
		queryKey: [ 'read', 'teams' ],
		queryFn: async () => mockIsAutomattician,
	} ),
} ) );

function createWrapper() {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	return ( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
}

describe( 'useMcpTracksAudienceProps', () => {
	beforeEach( () => {
		mockEnvId = 'production';
		mockIsAutomattician = true;
	} );

	it( 'string-encodes both properties for an Automattician in production', async () => {
		const { result } = renderHook( () => useMcpTracksAudienceProps(), {
			wrapper: createWrapper(),
		} );

		await waitFor( () => expect( result.current.is_a11n ).toBe( 'true' ) );
		expect( result.current ).toEqual( { is_a11n: 'true', is_test: 'false' } );
	} );

	it( 'marks a non-Automattician as is_a11n false', async () => {
		mockIsAutomattician = false;

		const { result } = renderHook( () => useMcpTracksAudienceProps(), {
			wrapper: createWrapper(),
		} );

		await waitFor( () => expect( result.current.is_a11n ).toBe( 'false' ) );
		expect( result.current ).toEqual( { is_a11n: 'false', is_test: 'false' } );
	} );

	it( 'defaults is_a11n to false while the teams query is unresolved', () => {
		const { result } = renderHook( () => useMcpTracksAudienceProps(), {
			wrapper: createWrapper(),
		} );

		expect( result.current.is_a11n ).toBe( 'false' );
	} );

	it.each( [ 'development', 'wpcalypso', 'horizon', 'stage', 'dashboard-stage' ] )(
		'marks the %s environment as test',
		( envId ) => {
			mockEnvId = envId;

			const { result } = renderHook( () => useMcpTracksAudienceProps(), {
				wrapper: createWrapper(),
			} );

			expect( result.current.is_test ).toBe( 'true' );
		}
	);

	it.each( [ 'production', 'dashboard-production', 'jetpack-cloud-production' ] )(
		'does not mark the %s environment as test',
		( envId ) => {
			mockEnvId = envId;

			const { result } = renderHook( () => useMcpTracksAudienceProps(), {
				wrapper: createWrapper(),
			} );

			expect( result.current.is_test ).toBe( 'false' );
		}
	);
} );
