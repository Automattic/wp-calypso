import { useQuery, useQueryClient } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { createPurchaseObject } from '../lib/assembler';
import type { Purchase, RawPurchase } from '../types';
import type { ComponentType } from 'react';

export interface UserPurchasesState {
	purchases: Purchase[];
	isLoading: boolean;
	isError: boolean;
	error: Error | undefined | null;
}

export interface WithUserPurchasesProps {
	userPurchasesState: UserPurchasesState;
}

async function fetchUserPurchases(): Promise< RawPurchase[] > {
	return await wpcomRequest( {
		path: '/me/purchases',
		apiVersion: '1.1',
	} );
}

async function fetchSitePurchases( siteId: number ): Promise< RawPurchase[] > {
	return await wpcomRequest( {
		path: `/sites/${ encodeURIComponent( siteId ) }/purchases`,
		apiVersion: '1.1',
	} );
}

async function fetchSinglePurchase( purchaseId: number ): Promise< RawPurchase > {
	return await wpcomRequest( {
		path: `/me/purchases/${ encodeURIComponent( purchaseId ) }`,
		apiVersion: '1.1',
	} );
}

async function fetchAndTransformPurchaseById(
	purchaseId: number
): Promise< Purchase | undefined > {
	const rawPurchase = await fetchSinglePurchase( purchaseId );
	return rawPurchase ? createPurchaseObject( rawPurchase ) : undefined;
}

async function fetchAndTransformSitePurchases( siteId: number ): Promise< Purchase[] > {
	const rawPurchases = await fetchSitePurchases( siteId );
	return rawPurchases.map( createPurchaseObject );
}

async function fetchAndTransformUserPurchases(): Promise< Purchase[] > {
	const rawPurchases = await fetchUserPurchases();
	return rawPurchases.map( createPurchaseObject );
}

function getPurchasesQueryKey( { siteId, purchaseId }: { siteId?: number; purchaseId?: number } ) {
	if ( purchaseId ) {
		return [ 'single-purchase', purchaseId ];
	}
	if ( siteId ) {
		return [ 'site-purchases', siteId ];
	}
	return [ 'user-purchases' ];
}

export function useUserPurchases( params?: {
	siteId?: number;
	purchaseId?: number;
} ): UserPurchasesState {
	const { siteId, purchaseId } = params ?? {};
	const queryClient = useQueryClient();
	const result = useQuery< Purchase[] >( {
		queryKey: getPurchasesQueryKey( { siteId, purchaseId } ),
		queryFn: async () => {
			if ( purchaseId ) {
				// If we are looking for just a single purchase, return it from
				// the user-purchases state, if it exists there already.
				const userPurchases = queryClient.getQueryData< Purchase[] >( getPurchasesQueryKey( {} ) );
				const purchasesMatchingId =
					userPurchases?.filter( ( purchase ) => purchase.id === purchaseId ) ?? [];
				if ( purchasesMatchingId.length > 0 ) {
					return purchasesMatchingId;
				}
				// If the user-purchases state does not contain this purchase,
				// fetch it and store it in the user-purchases state for later.
				const purchaseForId = await fetchAndTransformPurchaseById( purchaseId );
				if ( purchaseForId ) {
					queryClient.setQueryData( getPurchasesQueryKey( {} ), [ purchaseForId ] );
					return [ purchaseForId ];
				}
				return [];
			}

			if ( siteId ) {
				// If we are looking for just the user purchases for a site, return
				// site purchases from user-purchases state if they exist there already.
				const userPurchases = queryClient.getQueryData< Purchase[] >( getPurchasesQueryKey( {} ) );
				const sitePurchasesFromUser =
					userPurchases?.filter( ( purchase ) => purchase.siteId === siteId ) ?? [];
				if ( sitePurchasesFromUser.length > 0 ) {
					return sitePurchasesFromUser;
				}
				// If no site purchases exist in the user-purchases state for
				// this site, fetch them and store them in the user-purchases
				// state for later.
				const sitePurchases = await fetchAndTransformSitePurchases( siteId );
				queryClient.setQueryData( getPurchasesQueryKey( {} ), sitePurchases );
				return sitePurchases;
			}

			// If we are looking for all user purchases, fetch them.
			return fetchAndTransformUserPurchases();
		},
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
	} );
	return {
		purchases: result.data ?? [],
		isLoading: result.isLoading,
		isError: result.isError,
		error: result.error,
	};
}

export function withUserPurchases< P >( Component: ComponentType< P > ) {
	return function UserPurchasesWrapper( props: Omit< P, keyof WithUserPurchasesProps > ) {
		const state = useUserPurchases();
		return <Component { ...( props as P ) } userPurchasesState={ state } />;
	};
}
