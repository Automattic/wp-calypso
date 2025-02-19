import i18n, { useTranslate } from 'i18n-calypso';
import * as Purchases from '../../purchases';
import * as Site from '../../site';
import type { AddOnMeta } from '../types';

interface Props {
	addOnMeta: AddOnMeta;
	selectedSiteId?: number | null;
}

type AddOnPurchaseStatus = {
	available: boolean;
	text?: ReturnType< typeof i18n.translate >;
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
			const purchase: Purchases.Purchase = Object.values( matchingPurchases )[ 0 ];
			if ( purchase.purchaseRenewalQuantity === addOnMeta.quantity ) {
				return { available: false, text: translate( 'Purchased' ) };
			}
		} else {
			return { available: false, text: translate( 'Purchased' ) };
		}
	}

	if ( isSiteFeature ) {
		return { available: false, text: translate( 'Included in your plan' ) };
	}

	return { available: true };
};

export default useAddOnPurchaseStatus;
