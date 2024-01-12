import { isWooExpressPlan } from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import useIntroOffers from './use-intro-offers';
import type { PlanIntroductoryOffer } from '../types';

interface IntroOffersIndex {
	[ planSlug: string ]: PlanIntroductoryOffer | null;
}

interface Props {
	siteId: string | number | null | undefined;
	coupon: string | undefined;
}

/**
 * Get introductory offers for Woo Express plans that have these defined
 * - Currently retrieved off site-plans: https://public-api.wordpress.com/rest/v1.3/sites/[siteId]/plans
 * - Can be extended to include /plans endpoint
 * @returns {IntroOffersIndex | undefined | null} -
 *     an object of planSlug->PlanIntroductoryOffer if WooExpress plan offers are found, or
 *     undefined if we haven't observed any metadata yet, or
 *     null if there are no WooExpress intro offers
 */
const useIntroOffersForWooExpress = ( {
	siteId,
	coupon,
}: Props ): IntroOffersIndex | undefined | null => {
	const introOffers = useIntroOffers( { siteId, coupon } );

	return useMemo( () => {
		if ( ! introOffers ) {
			return introOffers;
		}

		const wooExpressIntroOffers = Object.keys( introOffers )
			.filter( isWooExpressPlan )
			.reduce< IntroOffersIndex >(
				( acc, planSlug ) => ( {
					...acc,
					...( introOffers[ planSlug ] && { [ planSlug ]: introOffers[ planSlug ] } ),
				} ),
				{}
			);

		return Object.keys( wooExpressIntroOffers ).length ? wooExpressIntroOffers : null;
	}, [ introOffers ] );
};

export default useIntroOffersForWooExpress;
