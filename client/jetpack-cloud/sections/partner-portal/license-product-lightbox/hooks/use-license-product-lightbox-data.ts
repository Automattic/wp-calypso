import { useMemo } from 'react';
import getProductIcon from 'calypso/my-sites/plans/jetpack-plans/product-store/utils/get-product-icon';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductTitle } from '../../utils';
import { ProductLightboxData } from '../types';

export function useLicenseProductLightboxData(
	product: APIProductFamilyProduct
): ProductLightboxData {
	return useMemo( () => {
		/*
		 * To reuse existing product info, we need to convert the product slug to the format used in the product store.
		 * We are also using only the monthly slug to ensure we hit the equivalent product in the product store.
		 */
		const normalizedSlug = product.slug.replaceAll( /-/g, '_' ) + '_monthly';
		const productInfo = slugToSelectorProduct( normalizedSlug );

		const title = getProductTitle( product.name );
		const icon = getProductIcon( { productSlug: normalizedSlug } );

		if ( productInfo ) {
			return {
				title,
				icon,
				...productInfo,
			} as ProductLightboxData;
		}

		return { title } as ProductLightboxData;
	}, [ product ] );
}
