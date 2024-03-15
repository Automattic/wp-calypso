import { useTranslate } from 'i18n-calypso';
import * as Purchases from '../../purchases';
import * as Site from '../../site';
import type { AddOnMeta } from '../types';

interface Props {
	addOnMeta: AddOnMeta;
	selectedSiteId?: number | null | undefined;
}

/**
 * Returns whether add-on product has been purchased or included in site plan.
 */
const useAddOnPurchaseStatus = ( { addOnMeta, selectedSiteId }: Props ) => {
	const translate = useTranslate();
	const matchingPurchases = Purchases.useSitePurchasesByProductSlug( {
		siteId: selectedSiteId,
		productSlug: addOnMeta.productSlug,
	} );
	const siteFeatures = Site.useSiteFeatures( { siteIdOrSlug: selectedSiteId } );
	const isSiteFeature = addOnMeta.featureSlugs?.find(
		( slug ) => siteFeatures.data?.active?.includes( slug )
	);

	/*
	 * Order matters below:
	 * 	1. Check if purchased first.
	 * 	2. Check if site feature next.
	 * Reason: `siteFeatures.active` involves both purchases and plan features.
	 */

	if ( matchingPurchases ) {
		return { available: false, text: translate( 'Purchased' ) };
	}

	if ( isSiteFeature ) {
		return { available: false, text: translate( 'Included in your plan' ) };
	}

	return { available: true };
};

export default useAddOnPurchaseStatus;
