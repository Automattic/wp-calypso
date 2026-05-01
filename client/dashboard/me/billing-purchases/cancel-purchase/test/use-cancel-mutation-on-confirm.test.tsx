/**
 * @jest-environment jsdom
 */
import { userPurchasesQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { CANCEL_FLOW_TYPE } from '../../../../utils/purchase';
import { useCancelMutationOnConfirm } from '../use-cancel-mutation-on-confirm';
import type { Purchase } from '@automattic/api-core';

jest.mock( '@automattic/api-core', () => ( {} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: jest.fn(),
		createErrorNotice: jest.fn(),
	} ),
} ) );

const mockPurchase = {
	ID: 12345,
	product_name: 'WordPress.com Business',
	product_slug: 'business-bundle',
	is_domain: false,
	is_plan: true,
	domain: 'example.wordpress.com',
	will_atomic_revert_after_removal: false,
} as Purchase;

function makeMutation() {
	const mutateAsync = jest.fn( () => Promise.resolve() );
	return { mutateAsync } as unknown as { mutateAsync: jest.Mock };
}

function makeMutations() {
	return {
		cancelAndRefundMutation: makeMutation(),
		setPurchaseAutoRenewMutation: makeMutation(),
	};
}

function makeQueryClient() {
	return new QueryClient( {
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	} );
}

function makeTestWrapper( queryClient: QueryClient ) {
	return function TestWrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};
}

describe( 'useCancelMutationOnConfirm', () => {
	test( 'fireMutationOnConfirm dispatches the auto-renew-off mutation for CANCEL_AUTORENEW flow', async () => {
		const mutations = makeMutations();
		const queryClient = makeQueryClient();

		const { result } = renderHook(
			() =>
				useCancelMutationOnConfirm( {
					purchase: mockPurchase,
					...mutations,
				} ),
			{ wrapper: makeTestWrapper( queryClient ) }
		);

		act( () => {
			result.current.fireMutationOnConfirm( CANCEL_FLOW_TYPE.CANCEL_AUTORENEW );
		} );

		await waitFor( () => {
			expect( mutations.setPurchaseAutoRenewMutation.mutateAsync ).toHaveBeenCalledWith( {
				purchaseId: mockPurchase.ID,
				autoRenew: false,
			} );
		} );
		expect( mutations.cancelAndRefundMutation.mutateAsync ).not.toHaveBeenCalled();
	} );

	test( 'fireMutationOnConfirm dispatches the cancel-and-refund mutation for CANCEL_WITH_REFUND flow', async () => {
		const mutations = makeMutations();
		const queryClient = makeQueryClient();

		const purchaseWithProductId = {
			...mockPurchase,
			product_id: 9876,
		} as Purchase;

		const { result } = renderHook(
			() =>
				useCancelMutationOnConfirm( {
					purchase: purchaseWithProductId,
					...mutations,
				} ),
			{ wrapper: makeTestWrapper( queryClient ) }
		);

		act( () => {
			result.current.fireMutationOnConfirm( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND, true );
		} );

		await waitFor( () => {
			expect( mutations.cancelAndRefundMutation.mutateAsync ).toHaveBeenCalledWith( {
				purchaseId: purchaseWithProductId.ID,
				options: {
					product_id: 9876,
					cancel_bundled_domain: true,
				},
			} );
		} );
		expect( mutations.setPurchaseAutoRenewMutation.mutateAsync ).not.toHaveBeenCalled();
	} );

	test( 'fireMutationOnConfirm strips the deleted purchase from userPurchasesQuery cache after CANCEL_WITH_REFUND', async () => {
		const mutations = makeMutations();
		const queryClient = makeQueryClient();

		const otherPurchase = { ID: 99999 } as Purchase;
		queryClient.setQueryData( userPurchasesQuery().queryKey, [ mockPurchase, otherPurchase ] );

		const { result } = renderHook(
			() =>
				useCancelMutationOnConfirm( {
					purchase: mockPurchase,
					...mutations,
				} ),
			{ wrapper: makeTestWrapper( queryClient ) }
		);

		act( () => {
			result.current.fireMutationOnConfirm( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
		} );

		await waitFor( () => {
			expect( queryClient.getQueryData( userPurchasesQuery().queryKey ) ).toEqual( [
				otherPurchase,
			] );
		} );
	} );

	test( 'fireMutationOnConfirm captures the purchase into snapshotPurchase for CANCEL_WITH_REFUND flow', async () => {
		const mutations = makeMutations();
		const queryClient = makeQueryClient();

		const { result } = renderHook(
			() =>
				useCancelMutationOnConfirm( {
					purchase: mockPurchase,
					...mutations,
				} ),
			{ wrapper: makeTestWrapper( queryClient ) }
		);

		act( () => {
			result.current.fireMutationOnConfirm( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
		} );

		await waitFor( () => {
			expect( result.current.snapshotPurchase ).toBe( mockPurchase );
		} );
	} );

	test( 'fireMutationOnConfirm does NOT capture snapshotPurchase for CANCEL_AUTORENEW flow', async () => {
		const mutations = makeMutations();
		const queryClient = makeQueryClient();

		const { result } = renderHook(
			() =>
				useCancelMutationOnConfirm( {
					purchase: mockPurchase,
					...mutations,
				} ),
			{ wrapper: makeTestWrapper( queryClient ) }
		);

		act( () => {
			result.current.fireMutationOnConfirm( CANCEL_FLOW_TYPE.CANCEL_AUTORENEW );
		} );

		await waitFor( () =>
			expect( mutations.setPurchaseAutoRenewMutation.mutateAsync ).toHaveBeenCalled()
		);
		expect( result.current.snapshotPurchase ).toBeNull();
	} );

	test( 'isPending is true while the mutation is in flight, false after it resolves', async () => {
		let resolveMutation: ( value?: unknown ) => void = () => {};
		const cancelAndRefundMutation = {
			mutateAsync: jest.fn(
				() =>
					new Promise( ( resolve ) => {
						resolveMutation = resolve;
					} )
			),
		} as unknown as { mutateAsync: jest.Mock };
		const setPurchaseAutoRenewMutation = makeMutation();
		const queryClient = makeQueryClient();

		const { result } = renderHook(
			() =>
				useCancelMutationOnConfirm( {
					purchase: mockPurchase,
					cancelAndRefundMutation,
					setPurchaseAutoRenewMutation,
				} ),
			{ wrapper: makeTestWrapper( queryClient ) }
		);

		expect( result.current.isPending ).toBe( false );

		act( () => {
			result.current.fireMutationOnConfirm( CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND );
		} );

		await waitFor( () => expect( result.current.isPending ).toBe( true ) );

		await act( async () => {
			resolveMutation();
		} );

		await waitFor( () => expect( result.current.isPending ).toBe( false ) );
	} );
} );
