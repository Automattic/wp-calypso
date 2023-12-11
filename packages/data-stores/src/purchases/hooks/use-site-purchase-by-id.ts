import { useCallback } from '@wordpress/element';
import useSitePurchases from '../queries/use-site-purchases';
import type { PurchasesIndex } from '../queries/use-site-purchases';
import type { Purchase } from '../types';

interface Props {
	purchaseId?: number | null;
	siteId?: string | number | null;
}

const useSitePurchaseById = ( { siteId, purchaseId }: Props ): Purchase | undefined => {
	const sitePurchase = useSitePurchases( {
		siteId,
		select: useCallback(
			( data: PurchasesIndex ) => {
				return typeof purchaseId === 'number' ? data[ purchaseId ] : undefined;
			},
			[ purchaseId ]
		),
	} );

	return sitePurchase.data;
};

export default useSitePurchaseById;
