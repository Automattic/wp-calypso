import useSitePurchases from '../queries/use-site-purchases';
import type { Purchase } from '../types';

interface Props {
	purchaseId?: number | null;
	siteId?: string | number | null;
}

const useSitePurchaseById = ( { siteId, purchaseId }: Props ): Purchase | undefined => {
	const sitePurchases = useSitePurchases( { siteId } );

	return sitePurchases?.data && typeof purchaseId === 'number'
		? sitePurchases?.data[ purchaseId ]
		: undefined;
};

export default useSitePurchaseById;
