import { userPurchasesQuery } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { CANCEL_FLOW_TYPE, type CancelFlowType } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

interface MutationLike< TVariables > {
	mutateAsync: ( variables: TVariables ) => Promise< unknown >;
}

interface CancelAndRefundVariables {
	purchaseId: number;
	options: {
		product_id: number;
		cancel_bundled_domain: boolean;
	};
}

interface SetAutoRenewVariables {
	purchaseId: number;
	autoRenew: boolean;
}

interface UseCancelMutationOnConfirmArgs {
	purchase: Purchase;
	cancelAndRefundMutation: MutationLike< CancelAndRefundVariables >;
	setPurchaseAutoRenewMutation: MutationLike< SetAutoRenewVariables >;
}

// Hook for the Cancel paths (CANCEL_AUTORENEW, CANCEL_WITH_REFUND) only —
// REMOVE defers its mutation to survey-submit, so it doesn't need the
// cache-guard machinery here.
export function useCancelMutationOnConfirm( {
	purchase,
	cancelAndRefundMutation,
	setPurchaseAutoRenewMutation,
}: UseCancelMutationOnConfirmArgs ) {
	const queryClient = useQueryClient();
	const [ isPending, setIsPending ] = useState( false );
	const [ snapshotPurchase, setSnapshotPurchase ] = useState< Purchase | null >( null );

	const fireMutationOnConfirm = useCallback(
		( effectiveFlowType: CancelFlowType, cancelBundledDomain?: boolean ): Promise< void > => {
			setIsPending( true );

			// Freeze the purchase before either mutation runs. Both invalidate
			// `userPurchasesQuery`, whose ['upgrades'] key is a prefix of
			// purchaseQuery's ['upgrades', id], so the live purchase refetches
			// mid-survey. Without the snapshot, `is_auto_renew_enabled` flipping
			// false re-derives the flow type under the survey and onSurveyComplete
			// reports a refund that never happened.
			setSnapshotPurchase( purchase );

			// CANCEL_AUTORENEW just disables auto-renew — the purchase stays in
			// the user's list, so the deletion-flow cache machinery
			// (strip-from-list) doesn't apply.
			if ( effectiveFlowType === CANCEL_FLOW_TYPE.CANCEL_AUTORENEW ) {
				return setPurchaseAutoRenewMutation
					.mutateAsync( { purchaseId: purchase.ID, autoRenew: false } )
					.then( () => undefined )
					.finally( () => {
						setIsPending( false );
					} );
			}

			return cancelAndRefundMutation
				.mutateAsync( {
					purchaseId: purchase.ID,
					options: {
						product_id: purchase.product_id,
						cancel_bundled_domain: cancelBundledDomain ?? false,
					},
				} )
				.then( () => {
					// One-shot strip on success. If the server's eventual-consistency
					// window returns the deleted purchase back on a subsequent
					// refetch, the user briefly sees it on the destination list;
					// accepted as a small UX cost over the previous re-stripping
					// daemon's brittleness.
					queryClient.setQueryData(
						userPurchasesQuery().queryKey,
						( old: Purchase[] | undefined ) => ( old ?? [] ).filter( ( p ) => p.ID !== purchase.ID )
					);
				} )
				.finally( () => {
					setIsPending( false );
				} );
		},
		[ purchase, cancelAndRefundMutation, setPurchaseAutoRenewMutation, queryClient ]
	);

	return { isPending, fireMutationOnConfirm, snapshotPurchase };
}
