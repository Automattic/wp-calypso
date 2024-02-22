import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSitePurchases } from 'calypso/state/purchases/selectors/get-site-purchases';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import type { AddOnMeta } from '@automattic/data-stores';

interface Props {
	addOnMeta: AddOnMeta;
	selectedSiteId?: number | null | undefined;
}

/**
 * Returns whether add-on product has been purchased or included in site plan.
 */
const useAddOnPurchaseStatus = ( { addOnMeta, selectedSiteId }: Props ) => {
	const translate = useTranslate();
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, selectedSiteId ) );
	const purchased = sitePurchases.find(
		( product ) => product.productSlug === addOnMeta.productSlug
	);
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

	if ( purchased ) {
		return { available: false, text: translate( 'Purchased' ) };
	}

	if ( isSiteFeature ) {
		return { available: false, text: translate( 'Included in your plan' ) };
	}

	return { available: true };
};

export default useAddOnPurchaseStatus;
