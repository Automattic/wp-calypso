import { useMemo } from 'react';
import slugToSelectorProduct from 'calypso/my-sites/plans/jetpack-plans/slug-to-selector-product';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getProductTitle from '../../lib/get-product-title';

type LicenseLightboxData = {
	title: string;
	product?: SelectorProduct;
};

export function useLicenseLightboxData( product: APIProductFamilyProduct ): LicenseLightboxData {
	return useMemo( () => {
		/*
		 * To reuse existing product info, we need to convert the product slug to the format used in the product store.
		 * We are also using only the monthly slug to ensure we hit the equivalent product in the product store.
		 */
		const baseSlug = product.slug.replaceAll( /-/g, '_' ).replace( /_(monthly|yearly)$/, '' );
		const productInfo =
			slugToSelectorProduct( baseSlug + '_monthly' ) ||
			slugToSelectorProduct( baseSlug + '_yearly' );

		const title = getProductTitle( product.name );

		if ( productInfo ) {
			return {
				title,
				product: productInfo,
			};
		}

		return { title };
	}, [ product ] );
}
