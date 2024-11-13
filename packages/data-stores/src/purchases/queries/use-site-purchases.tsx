import { UseQueryResult, useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { createPurchaseObject } from '../lib/assembler';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { RawPurchase, Purchase } from '../types';
import type { ComponentType } from 'react';

export interface PurchasesIndex {
	[ purchaseId: number ]: Purchase;
}

export interface GetUseSitePurchasesOptionsProps {
	siteId?: string | number | null;
}

export type SitePurchasesState = UseQueryResult< Purchase[], Error >;

export interface WithSitePurchasesProps {
	sitePurchasesState: SitePurchasesState;
}

async function fetchSitePurchases( siteId: string | number ): Promise< RawPurchase[] > {
	return await wpcomRequest( {
		path: `/sites/${ encodeURIComponent( siteId ) }/purchases`,
		apiVersion: '1.1',
	} );
}

async function fetchAndTransformSitePurchases(
	siteId: string | number
): Promise< PurchasesIndex > {
	const rawPurchases = await fetchSitePurchases( siteId );
	return Object.fromEntries(
		rawPurchases.map( ( rawPurchase ) => {
			const purchase = createPurchaseObject( rawPurchase );
			return [ purchase.id, purchase ];
		} )
	);
}

export function getUseSitePurchasesOptions(
	{ siteId }: GetUseSitePurchasesOptionsProps,
	queryKey: ( string | number | null | undefined )[]
) {
	return {
		// The queryKey should be hopefully generated with the siteId included.
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey,
		queryFn: async (): Promise< PurchasesIndex > => {
			if ( ! siteId ) {
				return Promise.resolve( {} );
			}
			return await fetchAndTransformSitePurchases( siteId );
		},
		enabled: !! siteId,
	};
}

/**
 * Fetches all purchases for a given site, transformed into a map of purchaseId => Purchase
 */
export default function useSitePurchases( { siteId }: GetUseSitePurchasesOptionsProps ) {
	const queryKeys = useQueryKeysFactory();

	return useQuery< PurchasesIndex, Error, PurchasesIndex >(
		getUseSitePurchasesOptions( { siteId }, queryKeys.sitePurchases( siteId ) )
	);
}

export function withSitePurchases< P >(
	Component: ComponentType< P >,
	siteId: GetUseSitePurchasesOptionsProps[ 'siteId' ]
) {
	return function UserPurchasesWrapper( props: Omit< P, keyof WithSitePurchasesProps > ) {
		const state = useSitePurchases( { siteId } );
		return <Component { ...( props as P ) } sitePurchasesState={ state } />;
	};
}
