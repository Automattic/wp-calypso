import {
	fetchReferrals,
	fetchReferralCommissionPayout,
	archiveReferral,
	resendReferralEmail,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { Referral, ReferralApiResponse } from '@automattic/api-core';

/**
 * Groups the raw referrals list (one entry per referral order) by client, so
 * the dashboard can show a single row per client with their combined
 * purchases and statuses. Fully-archived clients are sorted to the end.
 */
function getClientReferrals( referrals: ReferralApiResponse[] ): Referral[] {
	const sortedReferrals = referrals.slice().reverse();
	const clientReferrals = sortedReferrals.map( ( referral ) => {
		const purchases = referral.products.map( ( product ) => ( {
			...product,
			referral_id: referral.id,
		} ) );

		return {
			id: referral.client.id,
			client: referral.client,
			purchases,
			purchaseStatuses: purchases.map( ( purchase ) => purchase.status ),
			referralStatuses: [ referral.status ],
			referrals: [ referral ],
		};
	} );

	const reducedReferrals = clientReferrals.reduce( ( acc: Referral[], current ) => {
		const existing = acc.find( ( item ) => item.id === current.id );
		if ( existing ) {
			existing.purchases.push( ...current.purchases );
			existing.purchaseStatuses.push( ...current.purchaseStatuses );
			existing.referralStatuses.push( ...current.referralStatuses );
			existing.referrals.push( ...current.referrals );
		} else {
			acc.push( current );
		}
		return acc;
	}, [] );

	return reducedReferrals.sort( ( a, b ) => {
		const aAllArchived = a.referralStatuses.every( ( status ) => status === 'archived' );
		const bAllArchived = b.referralStatuses.every( ( status ) => status === 'archived' );

		if ( aAllArchived && ! bAllArchived ) {
			return 1;
		}
		if ( ! aAllArchived && bAllArchived ) {
			return -1;
		}
		return 0;
	} );
}

export const referralsQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'referrals' ] as const,
		queryFn: async () => getClientReferrals( await fetchReferrals( agencyId ) ),
		enabled: !! agencyId,
	} );

export const referralCommissionPayoutQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'referral-commission-payout' ] as const,
		queryFn: () => fetchReferralCommissionPayout( agencyId ),
		enabled: !! agencyId,
	} );

/**
 * Returns the referrals list with the given referral order marked archived,
 * preserving the grouped-by-client shape produced by `referralsQuery`. Exported
 * for hosts that run their own QueryClient and apply the optimistic update at
 * the call site.
 */
export function archiveReferralInList( referrals: Referral[], referralId: number ): Referral[] {
	return referrals.map( ( client ) => {
		if ( ! client.referrals.some( ( order ) => order.id === referralId ) ) {
			return client;
		}
		const orders = client.referrals.map( ( order ) =>
			order.id === referralId ? { ...order, status: 'archived' } : order
		);
		return {
			...client,
			referrals: orders,
			referralStatuses: orders.map( ( order ) => order.status ),
		};
	} );
}

export const archiveReferralMutation = ( agencyId: number ) => {
	const queryKey = referralsQuery( agencyId ).queryKey;
	return mutationOptions( {
		meta: { statId: 'agcy-referral-archive' },
		mutationFn: ( referralId: number ) => archiveReferral( agencyId, referralId ),
		onMutate: async ( referralId: number ) => {
			await queryClient.cancelQueries( { queryKey } );
			const previous = queryClient.getQueryData< Referral[] >( queryKey );
			if ( previous ) {
				queryClient.setQueryData( queryKey, archiveReferralInList( previous, referralId ) );
			}
			return { previous };
		},
		onError: ( _error: unknown, _referralId: number, context?: { previous?: Referral[] } ) => {
			if ( context?.previous ) {
				queryClient.setQueryData( queryKey, context.previous );
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries( { queryKey } );
		},
	} );
};

export const resendReferralEmailMutation = ( agencyId: number ) =>
	mutationOptions( {
		meta: { statId: 'agcy-referral-email-resend' },
		mutationFn: ( referralId: number ) => resendReferralEmail( agencyId, referralId ),
	} );
