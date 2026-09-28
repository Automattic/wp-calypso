/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useSetCompPlanMutation } from '../use-set-comp-plan-mutation';
import type { ReactNode } from 'react';

const mockPost = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			post: ( ...args: unknown[] ) => mockPost( ...args ),
		},
	},
} ) );

describe( 'useSetCompPlanMutation', () => {
	let queryClient: QueryClient;
	let wrapper: ( props: { children: ReactNode } ) => JSX.Element;

	beforeEach( () => {
		mockPost.mockReset();
		mockPost.mockResolvedValue( { current_step: 'subscribers' } );

		queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
		} );

		wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	it( 'grants comps against a WordPress.com tier rather than a Stripe plan', async () => {
		const { result } = renderHook( () => useSetCompPlanMutation(), { wrapper } );

		result.current.setCompPlan( 123, 'substack', 'subscribers', '10' );

		await waitFor( () => expect( mockPost ).toHaveBeenCalled() );

		const [ , body ] = mockPost.mock.calls[ 0 ];
		expect( body ).toEqual( {
			engine: 'substack',
			current_step: 'subscribers',
			comp_product_id: '10',
		} );
	} );

	it( 'optimistically records the chosen tier so the import button unblocks', async () => {
		// Hold the request open so the optimistic write is what we observe, not the response.
		mockPost.mockReturnValue( new Promise( () => {} ) );
		queryClient.setQueryData( [ 'paid-newsletter-importer', 123, 'substack' ], {
			steps: { subscribers: { content: { comp_product_id: null } } },
		} );

		const { result } = renderHook( () => useSetCompPlanMutation(), { wrapper } );

		result.current.setCompPlan( 123, 'substack', 'subscribers', '10' );

		await waitFor( () => {
			const cached = queryClient.getQueryData< {
				steps: { subscribers: { content: { comp_product_id: number | null } } };
			} >( [ 'paid-newsletter-importer', 123, 'substack' ] );
			expect( cached?.steps.subscribers.content.comp_product_id ).toBe( 10 );
		} );
	} );

	it( 'clears the selection when an empty tier is sent', async () => {
		const { result } = renderHook( () => useSetCompPlanMutation(), { wrapper } );

		result.current.setCompPlan( 123, 'substack', 'subscribers', '' );

		await waitFor( () => expect( mockPost ).toHaveBeenCalled() );

		const [ , body ] = mockPost.mock.calls[ 0 ];
		expect( body.comp_product_id ).toBe( '' );
	} );
} );
