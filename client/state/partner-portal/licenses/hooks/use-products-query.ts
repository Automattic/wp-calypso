import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import selectAlphabeticallySortedProductOptions from 'calypso/jetpack-cloud/sections/partner-portal/lib/select-alphabetically-sorted-product-options';
import wpcom, { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import { APIProductFamily, APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { errorNotice } from '../../../notices/actions';

function queryProducts( isPublicFacing: boolean ): Promise< APIProductFamily[] > {
	const productsAPIPath = isPublicFacing
		? '/jetpack-licensing/public/manage-pricing'
		: '/jetpack-licensing/partner/product-families';
	const requestObject = isPublicFacing ? wpcom.req : wpcomJpl.req;
	return requestObject
		.get( {
			apiNamespace: 'wpcom/v2',
			path: productsAPIPath,
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

export function usePublicProductsQuery(): UseQueryResult< APIProductFamilyProduct[], unknown > {
	return useProductsQuery( true );
}

export default function useProductsQuery(
	isPublicFacing = false
): UseQueryResult< APIProductFamilyProduct[], unknown > {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );

	const query = useQuery( {
		queryKey: [ 'partner-portal', 'licenses', 'products', isPublicFacing ],
		queryFn: () => queryProducts( isPublicFacing ),
		select: selectAlphabeticallySortedProductOptions,
		enabled: isPublicFacing || isPartnerOAuthTokenLoaded,
		refetchOnWindowFocus: false,
	} );

	const { isError } = query;

	useEffect( () => {
		if ( isError ) {
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
		}
	}, [ dispatch, translate, isError ] );

	return query;
}
