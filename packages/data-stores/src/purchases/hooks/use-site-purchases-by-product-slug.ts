import { useMemo } from '@wordpress/element';
import useSitePurchases, { PurchasesIndex } from '../queries/use-site-purchases';

interface Props {
	productSlug: string | null | undefined;
	siteId?: string | number | null;
}

/**
 * Fetches site-purchases matching product slug for a given site
 * @returns `PurchasesIndex` if found, `null` if none found, `undefined` if sitePurchases is undefined
 */
const useSitePurchasesByProductSlug = ( {
	siteId,
	productSlug,
}: Props ): PurchasesIndex | null | undefined => {
	const sitePurchases = useSitePurchases( { siteId } );

	const matches = useMemo( () => {
		return Object.fromEntries(
			Object.entries( sitePurchases?.data ?? {} ).filter(
				( [ , purchase ] ) => purchase.productSlug === productSlug
			)
		);
	}, [ sitePurchases.data, productSlug ] );

	if ( ! sitePurchases.data ) {
		return undefined;
	}

	return Object.keys( matches ).length === 0 ? null : matches;
};

export default useSitePurchasesByProductSlug;
