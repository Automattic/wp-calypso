import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import getProductsRaw from 'calypso/jetpack-cloud/sections/partner-portal/lib/get-products-raw';
import selectAlphabeticallySortedProductOptions from 'calypso/jetpack-cloud/sections/partner-portal/lib/select-alphabetically-sorted-product-options';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { APIProductFamily, APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

function queryProducts(
	isPublicFacing: boolean,
	agencyId?: number
): Promise< APIProductFamily[] > {
	const productsAPIPath = isPublicFacing
		? '/jetpack-licensing/public/manage-pricing'
		: '/jetpack-licensing/partner/product-families';

	return wpcom.req
		.get(
			{
				apiNamespace: 'wpcom/v2',
				path: productsAPIPath,
			},
			{
				...( agencyId && { agency_id: agencyId } ),
			}
		)
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

const getProductsQueryKey = ( isPublicFacing: boolean, agencyId?: number ) => [
	'a4a',
	'marketplace',
	'products',
	isPublicFacing,
	agencyId,
];

export default function useProductsQuery(
	isPublicFacing = false,
	includeRawData = false,
	useStaleData = false
): UseQueryResult< APIProductFamilyProduct[], unknown > {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const agencyId = useSelector( getActiveAgencyId );

	const queryClient = useQueryClient();
	const data = queryClient.getQueryData( getProductsQueryKey( isPublicFacing, agencyId ) );

	let staleTime = 0;

	// If we have data and we want to use stale data, set the stale time to Infinity to prevent refetching.
	if ( useStaleData && data ) {
		staleTime = Infinity;
	}

	const query = useQuery( {
		queryKey: getProductsQueryKey( isPublicFacing, agencyId ),
		queryFn: () => queryProducts( isPublicFacing, agencyId ),
		select: includeRawData ? getProductsRaw : selectAlphabeticallySortedProductOptions,
		enabled: isPublicFacing || !! agencyId,
		refetchOnWindowFocus: false,
		staleTime,
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
						id: 'a4a-marketplace-product-families-failure',
					}
				)
			);
		}
	}, [ dispatch, translate, isError ] );

	return query;
}
