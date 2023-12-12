import { useMemo } from 'react';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getProductInfo from '../../lib/get-product-info';
import getProductTitle from '../../lib/get-product-title';

type LicenseLightboxData = {
	title: string;
	product?: SelectorProduct;
};

export function useLicenseLightboxData( product: APIProductFamilyProduct ): LicenseLightboxData {
	return useMemo( () => {
		const productInfo = getProductInfo( product.slug );

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
