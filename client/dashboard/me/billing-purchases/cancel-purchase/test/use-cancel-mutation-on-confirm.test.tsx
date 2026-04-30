/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useState, type ReactNode } from 'react';
import { CANCEL_FLOW_TYPE } from '../../../../utils/purchase';
import { useCancelMutationOnConfirm } from '../use-cancel-mutation-on-confirm';
import type { Purchase } from '@automattic/api-core';

jest.mock( '@automattic/api-core', () => ( {} ) );

const mockNavigate = jest.fn();

jest.mock( '@tanstack/react-router', () => {
	const actual = jest.requireActual( '@tanstack/react-router' );
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
} );

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
		removePurchaseMutator: makeMutation(),
		cancelAndRefundMutation: makeMutation(),
		setPurchaseAutoRenewMutation: makeMutation(),
	};
}

function TestWrapper( { children }: { children: ReactNode } ) {
	const [ queryClient ] = useState(
		() =>
			new QueryClient( {
				defaultOptions: {
					queries: { retry: false },
					mutations: { retry: false },
				},
			} )
	);
	return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
}

describe( 'useCancelMutationOnConfirm', () => {
	beforeEach( () => {
		mockNavigate.mockClear();
	} );

	test( 'fireMutationOnConfirm dispatches the remove mutation for REMOVE flow', async () => {
		const mutations = makeMutations();

		const { result } = renderHook(
			() =>
				useCancelMutationOnConfirm( {
					purchase: mockPurchase,
					...mutations,
					destinationRoute: '/me/purchases',
				} ),
			{ wrapper: TestWrapper }
		);

		act( () => {
			result.current.fireMutationOnConfirm( CANCEL_FLOW_TYPE.REMOVE );
		} );

		await waitFor( () => {
			expect( mutations.removePurchaseMutator.mutateAsync ).toHaveBeenCalledWith( mockPurchase.ID );
		} );
		expect( mutations.cancelAndRefundMutation.mutateAsync ).not.toHaveBeenCalled();
		expect( mutations.setPurchaseAutoRenewMutation.mutateAsync ).not.toHaveBeenCalled();
	} );

	test( 'fireMutationOnConfirm dispatches the auto-renew-off mutation for CANCEL_AUTORENEW flow', async () => {
		const mutations = makeMutations();

		const { result } = renderHook(
			() =>
				useCancelMutationOnConfirm( {
					purchase: mockPurchase,
					...mutations,
					destinationRoute: '/me/purchases',
				} ),
			{ wrapper: TestWrapper }
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
		expect( mutations.removePurchaseMutator.mutateAsync ).not.toHaveBeenCalled();
		expect( mutations.cancelAndRefundMutation.mutateAsync ).not.toHaveBeenCalled();
	} );

	test( 'isPending is true while the mutation is in flight, false after it resolves', async () => {
		let resolveMutation: ( value?: unknown ) => void = () => {};
		const removePurchaseMutator = {
			mutateAsync: jest.fn(
				() =>
					new Promise( ( resolve ) => {
						resolveMutation = resolve;
					} )
			),
		} as unknown as { mutateAsync: jest.Mock };
		const cancelAndRefundMutation = makeMutation();
		const setPurchaseAutoRenewMutation = makeMutation();

		const { result } = renderHook(
			() =>
				useCancelMutationOnConfirm( {
					purchase: mockPurchase,
					cancelAndRefundMutation,
					removePurchaseMutator,
					setPurchaseAutoRenewMutation,
					destinationRoute: '/me/purchases',
				} ),
			{ wrapper: TestWrapper }
		);

		expect( result.current.isPending ).toBe( false );

		act( () => {
			result.current.fireMutationOnConfirm( CANCEL_FLOW_TYPE.REMOVE );
		} );

		await waitFor( () => expect( result.current.isPending ).toBe( true ) );

		await act( async () => {
			resolveMutation();
		} );

		await waitFor( () => expect( result.current.isPending ).toBe( false ) );
	} );

	test( 'skipSurvey navigates to destination without dispatching any mutation', () => {
		const mutations = makeMutations();

		const { result } = renderHook(
			() =>
				useCancelMutationOnConfirm( {
					purchase: mockPurchase,
					...mutations,
					destinationRoute: '/me/purchases',
				} ),
			{ wrapper: TestWrapper }
		);

		act( () => {
			result.current.skipSurvey();
		} );

		expect( mockNavigate ).toHaveBeenCalledWith( { to: '/me/purchases' } );
		expect( mutations.removePurchaseMutator.mutateAsync ).not.toHaveBeenCalled();
		expect( mutations.cancelAndRefundMutation.mutateAsync ).not.toHaveBeenCalled();
		expect( mutations.setPurchaseAutoRenewMutation.mutateAsync ).not.toHaveBeenCalled();
	} );
} );
