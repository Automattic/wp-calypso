import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { createPurchaseObject } from '../lib/assembler';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { RawPurchase, Purchase } from '../types';

interface Props {
	userId?: string | number;
}

export function getUseTransferredPurchasesOptions(
	{ userId }: Props,
	queryKey: ( string | number | null | undefined )[]
) {
	return {
		queryKey,
		queryFn: async (): Promise< Purchase[] > => {
			const purchases: RawPurchase[] = await wpcomRequest( {
				path: '/me/purchases/transferred',
				apiVersion: '1.1',
			} );

			return purchases.map( ( rawPurchase ) => createPurchaseObject( rawPurchase ) );
		},
		enabled: !! userId,
	};
}

/**
 * Fetches all purchases for a given site, transformed into a map of purchaseId => Purchase
 * @param {Object} props - The properties for the function
 * @param props.userId Site ID
 * @returns Query result
 */
function useGetJetpackTransferredLicensePurchases( { userId }: Props ) {
	const queryKeys = useQueryKeysFactory();

	return useQuery< Purchase[] >(
		getUseTransferredPurchasesOptions( { userId }, queryKeys.transferredPurchases( userId ) )
	);
}

export default useGetJetpackTransferredLicensePurchases;
