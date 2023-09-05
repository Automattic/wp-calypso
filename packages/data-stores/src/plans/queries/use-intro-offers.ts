import { useQuery } from '@tanstack/react-query';
import { useCallback } from '@wordpress/element';
import wpcomRequest from 'wpcom-proxy-request';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { PlanIntroductoryOffer, PricedAPISitePlan } from '../types';

interface IntroOffersIndex {
	[ planSlug: string ]: PlanIntroductoryOffer | null;
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

	return {
		formattedPrice: sitePlan.introductory_offer_formatted_price as string,
		rawPrice: sitePlan.introductory_offer_raw_price as number,
		intervalUnit: sitePlan.introductory_offer_interval_unit as string,
		intervalCount: sitePlan.introductory_offer_interval_count as number,
	};
};

function useIntroOffers( { siteId }: Props ) {
	const queryKeys = useQueryKeysFactory();

	return useQuery< PricedAPISitePlansIndex, Error, IntroOffersIndex >( {
		queryKey: queryKeys.introOffers( siteId ),
		queryFn: async () =>
			await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/plans`,
				apiVersion: '1.3',
			} ),
		select: useCallback( ( data: PricedAPISitePlansIndex ) => {
			return Object.keys( data ).reduce< IntroOffersIndex >( ( acc, productId ) => {
				const plan = data[ Number( productId ) ];
				const introOffer = unpackIntroOffer( plan );
				return {
					...acc,
					[ plan.product_slug ]: introOffer ? { ...introOffer } : null,
				};
			}, {} );
		}, [] ),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: !! siteId,
	} );
}

export default useIntroOffers;
