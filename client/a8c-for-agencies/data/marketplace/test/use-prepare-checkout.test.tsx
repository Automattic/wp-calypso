/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import usePrepareCheckoutMutation from '../use-prepare-checkout';
import type { ReactNode } from 'react';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { post: jest.fn() } },
} ) );

const mockPost = wpcom.req.post as jest.Mock;

const request = {
	source: {
		id: 'pressable_titan',
		endpoint: '/agency/pressable/titan-checkout',
		requiredParams: [ 'agency_id', 'domain', 'quantity', 'signature' ],
		optionalParams: [ 'plan', 'is_trial' ],
	},
	params: {
		agency_id: '256533027',
		domain: 'titantest7.blog',
		quantity: '2',
		signature: 'abc123',
	},
};

function wrapper( { children }: { children: ReactNode } ) {
	const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
	return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
}

describe( 'usePrepareCheckoutMutation', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'posts the raw params to the source endpoint under wpcom/v2 and resolves the response', async () => {
		const response = {
			cart_key: 'no-site',
			products: [ { product_id: 1234, quantity: 2 } ],
			details: { domain: 'titantest7.blog' },
		};
		mockPost.mockResolvedValue( response );

		const { result } = renderHook( () => usePrepareCheckoutMutation(), { wrapper } );
		act( () => result.current.mutate( request ) );

		await waitFor( () => expect( result.current.status ).toBe( 'success' ) );
		expect( mockPost ).toHaveBeenCalledWith( {
			apiNamespace: 'wpcom/v2',
			path: '/agency/pressable/titan-checkout',
			body: request.params,
		} );
		expect( result.current.data ).toEqual( response );
	} );

	it( 'surfaces the endpoint error', async () => {
		mockPost.mockRejectedValue( {
			status: 403,
			code: 'titan_unauthorized_buyer',
			message: 'Only the agency owner can buy Titan inboxes.',
		} );

		const { result } = renderHook( () => usePrepareCheckoutMutation(), { wrapper } );
		act( () => result.current.mutate( request ) );

		await waitFor( () => expect( result.current.status ).toBe( 'error' ) );
		expect( result.current.error?.code ).toBe( 'titan_unauthorized_buyer' );
	} );
} );
