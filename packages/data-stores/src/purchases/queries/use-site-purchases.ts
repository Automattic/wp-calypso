import { useQuery } from '@tanstack/react-query';
import { useCallback } from '@wordpress/element';
import wpcomRequest from 'wpcom-proxy-request';
import { createPurchaseObject } from '../lib/assembler';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { RawPurchase, Purchase } from '../types';

interface PurchasesIndex {
	[ purchaseId: number ]: Purchase;
}

interface Props {
	siteId?: string | number | null;
}

function useSitePurchases( { siteId }: Props ) {
	const queryKeys = useQueryKeysFactory();

	return useQuery< RawPurchase[], Error, PurchasesIndex >( {
		queryKey: queryKeys.sitePurchases( siteId ),
		queryFn: async () =>
			await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/purchases`,
				apiVersion: '1.3',
			} ),
		select: useCallback( ( data: RawPurchase[] ) => {
			return data.reduce< PurchasesIndex >( ( acc, rawPurchase ) => {
				const purchase = createPurchaseObject( rawPurchase );
				return {
					...acc,
					[ purchase.id ]: purchase,
				};
			}, {} );
		}, [] ),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: !! siteId,
	} );
}

export default useSitePurchases;
