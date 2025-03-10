/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wpcom from 'calypso/lib/wp';
import useSubscriberCountQuery, { defaultSubscribersTotals } from '../use-subscriber-count-query';

const mockResponse = {
	counts: {
		email_subscribers: 100,
		paid_subscribers: 50,
		social_followers: 200,
	},
};

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

describe( 'useSubscriberCountQuery', () => {
	let queryClient: QueryClient;
	let wrapper: React.FC< React.PropsWithChildren< any > >;

	beforeEach( () => {
		( wpcom.req.get as jest.MockedFunction< typeof wpcom.req.get > ).mockReset();

		queryClient = new QueryClient( {
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		} );

		wrapper = ( { children }: React.PropsWithChildren< any > ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should call wpcom.req.get with the right parameters', async () => {
		( wpcom.req.get as jest.MockedFunction< typeof wpcom.req.get > ).mockResolvedValue(
			mockResponse
		);

		const { result } = renderHook( () => useSubscriberCountQuery( 123 ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( wpcom.req.get ).toHaveBeenCalledWith( {
			path: '/sites/123/subscribers/counts',
			apiNamespace: 'wpcom/v2',
		} );
	} );

	it( 'should return expected data when successful', async () => {
		( wpcom.req.get as jest.MockedFunction< typeof wpcom.req.get > ).mockResolvedValue(
			mockResponse
		);

		const { result } = renderHook( () => useSubscriberCountQuery( 123 ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( mockResponse.counts );
	} );

	it( 'should handle empty response', async () => {
		( wpcom.req.get as jest.MockedFunction< typeof wpcom.req.get > ).mockResolvedValue( {} );

		const { result } = renderHook( () => useSubscriberCountQuery( 123 ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( defaultSubscribersTotals );
	} );
} );
