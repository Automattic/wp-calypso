import { useMemo } from '@wordpress/element';
import usePlans from '../queries/use-plans';
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
 * - Returns a union of the introductory offers from `/plans` and `/sites/[siteId]/plans` endpoints
 * - `/sites/[siteId]/plans` takes precedence over `/plans` (if both are defined for a plan)
 * - See respective `usePlans` and `useSitePlans` hooks for more details
 * @returns {IntroOffersIndex | undefined} - an object `{ [ planSlug: string ]: PlanIntroductoryOffer | null }`,
 * or `undefined` if we haven't observed any metadata yet
 */
const useIntroOffers = ( { siteId }: Props ): IntroOffersIndex | undefined => {
	const sitePlans = useSitePlans( { siteId } );
	const plans = usePlans();

	return useMemo( () => {
		if ( ! sitePlans.data || ! plans.data ) {
			return undefined;
		}

		return Object.keys( { ...sitePlans.data, ...plans.data } ).reduce< IntroOffersIndex >(
			( acc, planSlug ) => {
				const plan = sitePlans.data[ planSlug ] ?? plans.data[ planSlug ];

				return {
					...acc,
					[ planSlug ]: plan?.introOffer ?? null,
				};
			},
			{}
		);
	}, [ sitePlans.data, plans.data ] );
};

export default useIntroOffers;
