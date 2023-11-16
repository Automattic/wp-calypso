import { useQuery } from '@tanstack/react-query';
import { useCallback } from '@wordpress/element';
import wpcomRequest from 'wpcom-proxy-request';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { PlanIntroductoryOffer, PricedAPISitePlan, SitePlan } from '../types';

interface SitePlansIndex {
	[ planSlug: string ]: SitePlan;
}
interface PricedAPISitePlansIndex {
	[ productId: number ]: PricedAPISitePlan;
}

interface Props {
	siteId?: string | number | null;
}

const unpackIntroOffer = ( sitePlan: PricedAPISitePlan ): PlanIntroductoryOffer | null => {
	// these aren't grouped or separated. so no introductory offer if no cost or interval
	if (
		! sitePlan.introductory_offer_interval_unit &&
		! sitePlan.introductory_offer_interval_count
	) {
		return null;
	}

	const isOfferComplete = Boolean(
		sitePlan.expiry &&
			sitePlan.introductory_offer_end_date &&
			new Date( sitePlan.expiry ) > new Date( sitePlan.introductory_offer_end_date )
	);

	return {
		formattedPrice: sitePlan.introductory_offer_formatted_price as string,
		rawPrice: sitePlan.introductory_offer_raw_price as number,
		intervalUnit: sitePlan.introductory_offer_interval_unit as string,
		intervalCount: sitePlan.introductory_offer_interval_count as number,
		isOfferComplete,
	};
};

/**
 * - Plans from `/sites/[siteId]/plans`, unlike `/plans`, are returned indexed by product_id, and do not include that in the plan's payload.
 * - UI works with product/plan slugs everywhere, so returned index is transformed to be keyed by product_slug
 */
function useSitePlans( { siteId }: Props ) {
	const queryKeys = useQueryKeysFactory();

	return useQuery< PricedAPISitePlansIndex, Error, SitePlansIndex >( {
		queryKey: queryKeys.sitePlans( siteId ),
		queryFn: async () =>
			await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/plans`,
				apiVersion: '1.3',
			} ),
		select: useCallback( ( data: PricedAPISitePlansIndex ) => {
			return Object.keys( data ).reduce< SitePlansIndex >( ( acc, productId ) => {
				const plan = data[ Number( productId ) ];
				return {
					...acc,
					[ plan.product_slug ]: {
						planSlug: plan.product_slug,
						productId: Number( productId ),
						introOffer: unpackIntroOffer( plan ),
						expiry: plan.expiry,
					},
				};
			}, {} );
		}, [] ),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: !! siteId,
	} );
}

export default useSitePlans;
