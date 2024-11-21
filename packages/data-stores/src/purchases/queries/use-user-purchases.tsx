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

async function fetchAndTransformSitePurchases( siteId: number ): Promise< Purchase[] > {
	const rawPurchases = await fetchSitePurchases( siteId );
	return rawPurchases.map( createPurchaseObject );
}

async function fetchAndTransformUserPurchases(): Promise< Purchase[] > {
	const rawPurchases = await fetchUserPurchases();
	return rawPurchases.map( createPurchaseObject );
}

function getUserPurchasesQueryKey() {
	return [ 'user-purchases' ];
}

function getSitePurchasesQueryKey( siteId: number ) {
	return [ 'site-purchases', siteId ];
}

export function useUserPurchases( siteId?: number ): UserPurchasesState {
	const queryClient = useQueryClient();
	const result = useQuery< Purchase[] >( {
		// eslint can't tell that we are providing the siteId when it is needed
		// so we must disable the rule.
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: siteId ? getSitePurchasesQueryKey( siteId ) : getUserPurchasesQueryKey(),
		queryFn: async () => {
			// If we are looking for all user purchases, fetch them.
			if ( ! siteId ) {
				return fetchAndTransformUserPurchases();
			}
			// If we are looking for just the user purchases for a site, return
			// site purchases from user-purchases state if they exist.
			const userPurchases = queryClient.getQueryData< Purchase[] >( getUserPurchasesQueryKey() );
			const sitePurchasesFromUser =
				userPurchases?.filter( ( purchase ) => purchase.siteId === siteId ) ?? [];
			if ( sitePurchasesFromUser.length > 0 ) {
				return sitePurchasesFromUser;
			}
			// If no site purchases exist in the user-purchases state, fetch
			// them and store them in the user-purchases state for later.
			const sitePurchases = await fetchAndTransformSitePurchases( siteId );
			queryClient.setQueryData( getUserPurchasesQueryKey(), sitePurchases );
			return sitePurchases;
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
