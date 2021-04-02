/**
 * External dependencies
 */
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';

/**
 * Internal dependencies
 */
import { APIProductFamily } from 'calypso/state/partner-portal/types';
import wpcom from 'calypso/lib/wp';

function queryProducts(): Promise< APIProductFamily[] > {
	return wpcom.req.get( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/product-families',
	} );
}

export default function useProductsQuery< TError = unknown, TData = unknown >(
	options?: UseQueryOptions< APIProductFamily[], TError, TData >
): UseQueryResult< TData, TError > {
	return useQuery< APIProductFamily[], TError, TData >(
		[ 'partner-portal', 'licenses', 'products' ],
		queryProducts,
		options
	);
}
