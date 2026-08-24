import { useQuery } from '@tanstack/react-query';
import wpcomRequest from '../../wpcom-request';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { RawPurchase } from '../types';

export interface PurchasesIndex {
	[ purchaseId: number ]: RawPurchase;
}

interface Props {
	siteId?: string | number | null;
}

export function getUseSitePurchasesOptions(
	{ siteId }: Props,
	queryKey: ( string | number | null | undefined )[]
) {
	return {
		queryKey,
		queryFn: async (): Promise< PurchasesIndex > => {
			const purchases: RawPurchase[] = await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/purchases`,
				apiVersion: '1.2',
			} );

			return Object.fromEntries(
				purchases.map( ( rawPurchase ) => [ Number( rawPurchase.ID ), rawPurchase ] )
			);
		},
		enabled: !! siteId,
	};
}

/**
 * Fetches all purchases for a given site, transformed into a map of purchaseId => Purchase
 * @param {Object} props - The properties for the function
 * @param props.siteId Site ID
 * @returns Query result
 */
function useSitePurchases( { siteId }: Props ) {
	const queryKeys = useQueryKeysFactory();

	return useQuery< any, unknown, PurchasesIndex >(
		getUseSitePurchasesOptions( { siteId }, queryKeys.sitePurchases( siteId ) )
	);
}

export default useSitePurchases;
