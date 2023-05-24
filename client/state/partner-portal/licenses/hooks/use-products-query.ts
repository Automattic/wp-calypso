import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { selectAlphabeticallySortedProductOptions } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { APIProductFamily, APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { errorNotice } from '../../../notices/actions';

function queryProducts(): Promise< APIProductFamily[] > {
	return wpcomJpl.req
		.get( {
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/partner/product-families',
		} )
		.then( ( data: APIProductFamily[] ) => {
			const exclude = [
				'free',
				'personal',
				'premium',
				'professional',
				'jetpack-backup-daily',
				'jetpack-backup-realtime',
				'jetpack-backup-t0',
				'jetpack-security-daily',
				'jetpack-security-realtime',
			];

			return data
				.map( ( family ) => {
					return {
						...family,
						products: family.products
							.filter( ( product ) => {
								return exclude.indexOf( product.slug ) === -1;
							} )
							.map( ( product ) => ( {
								...product,
								family_slug: family.slug,
							} ) ),
					};
				} )
				.filter( ( family ) => {
					return family.products.length > 0;
				} );
		} );
}

export default function useProductsQuery(): UseQueryResult< APIProductFamilyProduct[], unknown > {
	const translate = useTranslate();
	const dispatch = useDispatch();

	return useQuery( [ 'partner-portal', 'licenses', 'products' ], queryProducts, {
		select: selectAlphabeticallySortedProductOptions,
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
	} );
}
