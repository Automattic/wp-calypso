import { fetchCancellationOffers, applyCancellationOffer } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const cancellationOffersQuery = ( siteId: number, purchaseId: number ) =>
	queryOptions( {
		queryKey: [ 'cancellation-offers', siteId, purchaseId ],
		queryFn: () => fetchCancellationOffers( siteId, purchaseId ),
	} );

export const applyCancellationOfferMutation = ( siteId: number, purchaseId: number ) =>
	mutationOptions( {
		mutationFn: () => applyCancellationOffer( siteId, purchaseId ),
		onSuccess: () => {
			queryClient.invalidateQueries( cancellationOffersQuery( siteId, purchaseId ) );
		},
	} );
