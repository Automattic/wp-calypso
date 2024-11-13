import { Purchases } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { Purchase, RawPurchase } from 'calypso/lib/purchases/types';
import type { ComponentType } from 'react';

export interface UserPurchasesState {
	purchases: Purchase[];
	isFetching: boolean;
	isError: boolean;
	error: Error | undefined | null;
}

export interface WithUserPurchasesProps {
	userPurchasesState: UserPurchasesState;
}

async function fetchUserPurchases(): Promise< RawPurchase[] > {
	return await wpcom.req.get( {
		path: '/me/purchases',
	} );
}

async function fetchAndTransformUserPurchases(): Promise< Purchase[] > {
	const rawPurchases = await fetchUserPurchases();
	return rawPurchases.map( Purchases.utils.createPurchaseObject );
}

export function useUserPurchases(): UserPurchasesState {
	const queryKey = [ 'user-purchases' ];
	const result = useQuery< Purchase[] >( {
		queryKey,
		queryFn: fetchAndTransformUserPurchases,
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
	} );
	return {
		purchases: result.data ?? [],
		isFetching: result.isFetching || result.isLoading,
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
