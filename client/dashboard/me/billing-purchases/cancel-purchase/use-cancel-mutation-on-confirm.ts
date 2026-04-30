import { purchaseQuery, userPurchasesQuery } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
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

interface UseCancelMutationOnConfirmArgs {
	purchase: Purchase;
	cancelAndRefundMutation: MutationLike< CancelAndRefundVariables >;
	removePurchaseMutator: MutationLike< number >;
	destinationRoute: string;
}

// Window for the cache-subscription guard. After this elapses, the server
// is assumed settled — ad-hoc, but matches PR-G's tested envelope.
const CACHE_GUARD_TTL_MS = 15_000;

export function useCancelMutationOnConfirm( {
	purchase,
	cancelAndRefundMutation,
	removePurchaseMutator,
	destinationRoute,
}: UseCancelMutationOnConfirmArgs ) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [ isPending, setIsPending ] = useState( false );

	const fireMutationOnConfirm = useCallback(
		( effectiveFlowType: CancelFlowType, cancelBundledDomain?: boolean ): Promise< void > => {
			setIsPending( true );

			const stripPurchaseFromList = () => {
				queryClient.setQueryData( userPurchasesQuery().queryKey, ( old: Purchase[] | undefined ) =>
					( old ?? [] ).filter( ( p ) => p.ID !== purchase.ID )
				);
			};

			// Re-strip the purchase from cache whenever any background refetch
			// (route loader, focus, the mutation's own invalidation cascade)
			// returns server data that still includes the just-deleted purchase
			// during the eventual-consistency window.
			const targetHash = JSON.stringify( userPurchasesQuery().queryKey );
			const unsubscribeGuard = queryClient.getQueryCache().subscribe( ( event ) => {
				if ( event.query.queryHash === targetHash ) {
					const data = event.query.state.data as Purchase[] | undefined;
					if ( data?.some( ( p ) => p.ID === purchase.ID ) ) {
						stripPurchaseFromList();
					}
				}
			} );

			setTimeout( () => {
				unsubscribeGuard();
				queryClient.invalidateQueries( userPurchasesQuery() );
			}, CACHE_GUARD_TTL_MS );

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
					stripPurchaseFromList();
					// Evict the individual purchase query so the prefix-matched
					// invalidation triggered by the mutation's onSuccess can't
					// refetch a 404 into the still-mounted survey observer.
					queryClient.removeQueries( {
						queryKey: purchaseQuery( purchase.ID ).queryKey,
					} );
				} )
				.finally( () => {
					setIsPending( false );
				} );
		},
		[ purchase, cancelAndRefundMutation, removePurchaseMutator, queryClient ]
	);

	const skipSurvey = useCallback( () => {
		navigate( { to: destinationRoute } );
	}, [ navigate, destinationRoute ] );

	return { isPending, fireMutationOnConfirm, skipSurvey };
}
