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
	removePurchaseMutator: MutationLike< number >;
	setPurchaseAutoRenewMutation: MutationLike< SetAutoRenewVariables >;
}

export function useCancelMutationOnConfirm( {
	purchase,
	cancelAndRefundMutation,
	removePurchaseMutator,
	setPurchaseAutoRenewMutation,
}: UseCancelMutationOnConfirmArgs ) {
	const queryClient = useQueryClient();
	const [ isPending, setIsPending ] = useState( false );
	const [ snapshotPurchase, setSnapshotPurchase ] = useState< Purchase | null >( null );

	const fireMutationOnConfirm = useCallback(
		( effectiveFlowType: CancelFlowType, cancelBundledDomain?: boolean ): Promise< void > => {
			setIsPending( true );

			// CANCEL_AUTORENEW just disables auto-renew — the purchase stays in
			// the user's list. None of the deletion-flow cache machinery
			// (strip-from-list, removeQueries, subscription guard) applies.
			if ( effectiveFlowType === CANCEL_FLOW_TYPE.CANCEL_AUTORENEW ) {
				return setPurchaseAutoRenewMutation
					.mutateAsync( { purchaseId: purchase.ID, autoRenew: false } )
					.then( () => undefined )
					.finally( () => {
						setIsPending( false );
					} );
			}

			// Capture snapshot synchronously, before the mutation fires. From this
			// point, the component reads from the snapshot instead of the live
			// query cache, which the mutation's invalidation will tear down.
			setSnapshotPurchase( purchase );

			const mutationPromise =
				effectiveFlowType === CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND
					? cancelAndRefundMutation.mutateAsync( {
							purchaseId: purchase.ID,
							options: {
								product_id: purchase.product_id,
								cancel_bundled_domain: cancelBundledDomain ?? false,
							},
					  } )
					: removePurchaseMutator.mutateAsync( purchase.ID );

			return mutationPromise
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
		[
			purchase,
			cancelAndRefundMutation,
			removePurchaseMutator,
			setPurchaseAutoRenewMutation,
			queryClient,
		]
	);

	return { isPending, fireMutationOnConfirm, snapshotPurchase };
}
