import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { createPurchaseObject } from '../lib/assembler';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { RawPurchase, Purchase } from '../types';

export interface PurchasesIndex {
	[ purchaseId: number ]: Purchase;
}

interface Props< T > {
	siteId?: string | number | null;
	select?: ( data: PurchasesIndex ) => T;
}

function useSitePurchases< T >( { siteId, select }: Props< T > ) {
	const queryKeys = useQueryKeysFactory();

	return useQuery( {
		queryKey: queryKeys.sitePurchases( siteId ),
		queryFn: async (): Promise< PurchasesIndex > => {
			const purchases = await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/purchases`,
				apiVersion: '1.1',
			} );

			return Object.fromEntries(
				purchases.map( ( rawPurchase: RawPurchase ) => {
					const purchase = createPurchaseObject( rawPurchase );
					return [ purchase.id, purchase ];
				} )
			);
		},
		select,
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: !! siteId,
	} );
}

export default useSitePurchases;
