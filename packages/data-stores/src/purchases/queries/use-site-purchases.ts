import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { createPurchaseObject } from '../lib/assembler';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { RawPurchase, Purchase } from '../types';

export interface PurchasesIndex {
	[ purchaseId: number ]: Purchase;
}

interface Props {
	siteId?: string | number | null;
}

/**
 * Fetches all purchases for a given site, transformed into a map of purchaseId => Purchase
 * @param {Object} props - The properties for the function
 * @param props.siteId Site ID
 * @returns Query result
 */
function useSitePurchases( { siteId }: Props ): UseQueryResult< PurchasesIndex > {
	const queryKeys = useQueryKeysFactory();

	return useQuery( {
		queryKey: queryKeys.sitePurchases( siteId ),
		queryFn: async (): Promise< PurchasesIndex > => {
			const purchases: RawPurchase[] = await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/purchases`,
				apiVersion: '1.1',
			} );

			return Object.fromEntries(
				purchases.map( ( rawPurchase ) => {
					const purchase = createPurchaseObject( rawPurchase );
					return [ purchase.id, purchase ];
				} )
			);
		},
		enabled: !! siteId,
	} );
}

export default useSitePurchases;
