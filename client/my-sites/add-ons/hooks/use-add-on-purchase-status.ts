import { Purchases, type AddOnMeta } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';

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
	const isSiteFeature = useSelector(
		( state ) =>
			selectedSiteId &&
			addOnMeta.featureSlugs?.find( ( slug ) => siteHasFeature( state, selectedSiteId, slug ) )
	);

	/*
	 * Order matters below:
	 * 	1. Check if purchased first.
	 * 	2. Check if site feature next.
	 * Reason: `siteHasFeature` involves both purchases and plan features.
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
