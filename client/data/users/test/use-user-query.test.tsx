/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import useUserQuery from '../use-user-query';
import type { PropsWithChildren } from 'react';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

const mockGet = jest.mocked( wpcom.req.get );

describe( 'useUserQuery', () => {
	let queryClient: QueryClient;
	let wrapper: React.FC< PropsWithChildren >;

	beforeEach( () => {
		jest.clearAllMocks();
		mockGet.mockResolvedValue( { ID: 123 } );
		queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );
		wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	test( 'fetches users by numeric ID', async () => {
		const { result } = renderHook( () => useUserQuery( 456, 123 ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( mockGet ).toHaveBeenCalledWith( '/sites/456/users/123' );
	} );

	test( 'keeps string identifiers as login lookups', async () => {
		const { result } = renderHook( () => useUserQuery( 456, '123' ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( mockGet ).toHaveBeenCalledWith( '/sites/456/users/login:123' );
	} );
} );
