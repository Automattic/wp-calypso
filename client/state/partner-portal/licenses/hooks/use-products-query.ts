import { useTranslate } from 'i18n-calypso';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { useDispatch } from 'react-redux';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { APIProductFamily } from 'calypso/state/partner-portal/types';
import { errorNotice } from '../../../notices/actions';

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
	const translate = useTranslate();
	const dispatch = useDispatch();

	return useQuery< APIProductFamily[], TError, TData >(
		[ 'partner-portal', 'licenses', 'products' ],
		queryProducts,
		{
			onError: () => {
				dispatch(
					errorNotice(
						translate(
							'We were unable to retrieve your latest product details. Please try again later.'
						),
						{
							id: 'partner-portal-product-families-failure',
						}
					)
				);
			},
			...options,
		}
	);
}
