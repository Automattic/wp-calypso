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

const fetchSitePurchases = ( siteId: string ): RawPurchase[] =>
	wpcomRequest( {
		path: `/sites/${ encodeURIComponent( siteId ) }/purchases`,
		apiVersion: '1.1',
	} );

function useSitePurchases( { siteId }: Props ) {
	const queryKeys = useQueryKeysFactory();

	return useQuery( {
		queryKey: queryKeys.sitePurchases( siteId ),
		queryFn: fetchSitePurchases( siteId as string ),
		select: useCallback( ( data: RawPurchase[] ) => {
			return data.reduce< PurchasesIndex >( ( acc, rawPurchase ) => {
				const purchase = createPurchaseObject( rawPurchase );
				return {
					...acc,
					[ purchase.id ]: purchase,
				};
			}, {} );
		}, [] ),
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: !! siteId,
	} );
}

export default useSitePurchases;
