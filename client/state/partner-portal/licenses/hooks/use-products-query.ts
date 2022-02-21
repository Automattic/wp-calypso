import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { APIProductFamily } from 'calypso/state/partner-portal/types';

function queryProducts(): Promise< APIProductFamily[] > {
	return wpcomJpl.req
		.get( {
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/partner/product-families',
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
