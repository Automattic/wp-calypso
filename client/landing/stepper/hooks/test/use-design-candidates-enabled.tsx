/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useDesignCandidatesEnabled } from '../use-design-candidates-enabled';
import type { ReactNode } from 'react';

let mockFlagOn = false;
const mockIsAutomattician = jest.fn();

jest.mock( '@automattic/calypso-config', () => ( {
	__esModule: true,
	default: { isEnabled: ( flag: string ) => mockFlagOn && flag === 'site-spec/design-candidates' },
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	isAutomatticianQuery: () => ( {
		queryKey: [ 'is-automattician' ],
		queryFn: () => mockIsAutomattician(),
	} ),
} ) );

const render = ( requested: boolean ) => {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return renderHook( () => useDesignCandidatesEnabled( requested ), {
		wrapper: ( { children }: { children: ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		),
	} );
};

describe( 'useDesignCandidatesEnabled', () => {
	beforeEach( () => {
		mockFlagOn = false;
		mockIsAutomattician.mockReset();
	} );

	it( 'is on with the flag, and does not check the user', () => {
		mockFlagOn = true;
		const { result } = render( true );

		expect( result.current ).toEqual( { isEnabled: true, isLoading: false } );
		expect( mockIsAutomattician ).not.toHaveBeenCalled();
	} );

	it( 'is off when nothing asks for it, and does not check the user', () => {
		const { result } = render( false );

		expect( result.current ).toEqual( { isEnabled: false, isLoading: false } );
		expect( mockIsAutomattician ).not.toHaveBeenCalled();
	} );

	it( 'loads, then turns on for an Automattician who asks for it', async () => {
		mockIsAutomattician.mockResolvedValue( true );
		const { result } = render( true );

		expect( result.current ).toEqual( { isEnabled: false, isLoading: true } );
		await waitFor( () =>
			expect( result.current ).toEqual( { isEnabled: true, isLoading: false } )
		);
	} );

	it( 'stays off for a user who is not an Automattician', async () => {
		mockIsAutomattician.mockResolvedValue( false );
		const { result } = render( true );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( result.current.isEnabled ).toBe( false );
	} );

	it( 'stays off when the check fails', async () => {
		mockIsAutomattician.mockRejectedValue( new Error( 'offline' ) );
		const { result } = render( true );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( result.current.isEnabled ).toBe( false );
	} );
} );
