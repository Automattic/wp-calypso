import { useMemo } from '@wordpress/element';
import useSitePlans from '../queries/use-site-plans';
import type { PlanIntroductoryOffer } from '../types';

interface IntroOffersIndex {
	[ planSlug: string ]: PlanIntroductoryOffer | null;
}

interface Props {
	siteId?: string | number | null;
}

/**
 * Get introductory offers for plans that have these defined
 *  - Currently retrieved off site-plans: https://public-api.wordpress.com/rest/v1.3/sites/[siteId]/plans
 *  - Can be extended to include /plans endpoint
 *
 * @returns {IntroOffersIndex | undefined} - an object of planSlug->PlanIntroductoryOffer, or undefined if we haven't observed any metadata yet
 */
const useIntroOffers = ( { siteId }: Props ): IntroOffersIndex | undefined => {
	const sitePlans = useSitePlans( { siteId } );

	return useMemo( () => {
		if ( ! sitePlans.data ) {
			return undefined;
		}

		return Object.values( sitePlans?.data ).reduce< IntroOffersIndex >( ( acc, plan ) => {
			return {
				...acc,
				[ plan.planSlug ]: plan.introOffer ?? null,
			};
		}, {} );
	}, [ sitePlans.data ] );
};

export default useIntroOffers;
