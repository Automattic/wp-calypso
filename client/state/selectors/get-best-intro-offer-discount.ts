import type { IntroOffer } from 'calypso/state/sites/intro-offers/types';
import type { AppState } from 'calypso/types';

/**
 * @param  {Object}  state       Global state tree
 * @param  {number}  productSlugs   The productSlugs to check for a best intro offer discount
 * @param  {number|null}  siteId      The ID of the site we're querying
 * @returns {number|null}        The best intro offer discount ( may be zero if no intro offers are found)
 */
export default function getBestIntroOfferDiscount(
	state: AppState,
	productSlugs: string[],
	siteId: number | null | 'none'
): number {
	const siteIdKey = siteId && typeof siteId === 'number' && siteId > 0 ? siteId : 'none';

	return (
		Object.values( state.sites?.introOffers?.items?.[ siteIdKey ] || {} ) as IntroOffer[]
	 ).reduce(
		( previousBest, currentOffer ) =>
			currentOffer.discountPercentage > previousBest &&
			productSlugs.includes( currentOffer.productSlug )
				? currentOffer.discountPercentage
				: previousBest,
		0
	);
}
