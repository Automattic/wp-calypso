import useSitePurchases from '../queries/use-site-purchases';
import type { RawPurchase } from '../types';

interface Props {
	purchaseId?: number | null;
	siteId?: string | number | null;
}

const useSitePurchaseById = ( { siteId, purchaseId }: Props ): RawPurchase | undefined => {
	const sitePurchases = useSitePurchases( { siteId } );

	return sitePurchases?.data && typeof purchaseId === 'number'
		? sitePurchases?.data[ purchaseId ]
		: undefined;
};

export default useSitePurchaseById;
