import i18n, { useTranslate } from 'i18n-calypso';
import * as Purchases from '../../purchases';
import * as Site from '../../site';
import type { AddOnMeta } from '../types';

interface Props {
	addOnMeta: AddOnMeta;
	selectedSiteId?: number | null;
}

type AddOnPurchaseStatus =
	| { available: true; reason?: never; text?: never }
	| {
			available: false;
			/**
			 * Why the add-on is unavailable: bought separately, or granted by the site's plan.
			 */
			reason: 'purchased' | 'included';
			text: ReturnType< typeof i18n.translate >;
	  };

/**
 * Returns whether add-on product has been purchased or included in site plan.
 */
const useAddOnPurchaseStatus = ( { addOnMeta, selectedSiteId }: Props ): AddOnPurchaseStatus => {
	const translate = useTranslate();
	const matchingPurchases = Purchases.useSitePurchasesByProductSlug( {
		siteId: selectedSiteId,
		productSlug: addOnMeta.productSlug,
	} );
	const siteFeatures = Site.useSiteFeatures( { siteIdOrSlug: selectedSiteId } );
	const isSiteFeature = addOnMeta.featureSlugs?.find(
		( slug ) => siteFeatures.data?.active?.includes( slug )
	);

	/**
	 * First, check if the add-on has a matching purchase. If storage add-on, check matching
	 * quantity. Secondly, check if the feature is active on the site. If there's no matching
	 * purchase but `siteFeatures.active` still contains the feature, it's because the feature is
	 * included in the plan.
	 */
	if ( matchingPurchases ) {
		if ( addOnMeta.quantity ) {
			// A site can hold several purchases of the same product slug, so check them all
			// rather than assuming the matching quantity is on the first one.
			const purchases: Purchases.RawPurchase[] = Object.values( matchingPurchases );
			if (
				purchases.some(
					( purchase ) => purchase.renewal_price_tier_usage_quantity === addOnMeta.quantity
				)
			) {
				return { available: false, reason: 'purchased', text: translate( 'Purchased' ) };
			}
		} else {
			return { available: false, reason: 'purchased', text: translate( 'Purchased' ) };
		}
	}

	if ( isSiteFeature ) {
		return { available: false, reason: 'included', text: translate( 'Included in your plan' ) };
	}

	return { available: true };
};

export default useAddOnPurchaseStatus;
