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
	return wpcom.req
		.get( {
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/product-families',
		} )
		.then( ( data: APIProductFamily[] ) => {
			const exclude = [ 'free', 'personal', 'premium', 'professional' ];

			return data
				.map( ( family ) => {
					return {
						...family,
						products: family.products.filter( ( product ) => {
							return exclude.indexOf( product.slug ) === -1;
						} ),
					};
				} )
				.filter( ( family ) => {
					return family.products.length > 0;
				} );
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
