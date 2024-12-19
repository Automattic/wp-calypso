import { useMemo } from '@wordpress/element';
import { type TranslateResult, useTranslate } from 'i18n-calypso';
import * as ProductsList from '../../products-list';
import { type AddOnPriceKey, getAddOnPriceKey, useAddOnPrices } from './use-add-on-prices';

type AddOnDisplayCost = {
	[ key in string ]: TranslateResult;
};

const useAddOnDisplayCost = ( priceKeys: AddOnPriceKey[] ) => {
	const translate = useTranslate();
	const addOnPrices = useAddOnPrices( priceKeys );
	const productSlugs = priceKeys.map( ( { productSlug } ) => productSlug );
	const productsList = ProductsList.useProducts( productSlugs );

	return useMemo( () => {
		return priceKeys.reduce< AddOnDisplayCost >( ( accum, priceKey ) => {
			const { productSlug } = priceKey;
			const product = productsList.data?.[ productSlug ];
			const key = getAddOnPriceKey( priceKey );
			const prices = addOnPrices[ key ];
			const formattedCost = prices?.formattedMonthlyPrice || '';
			if ( product?.term === 'month' ) {
				/* Translators: %(formattedCost)s: monthly price formatted with currency */
				return {
					[ key ]: translate( '%(formattedCost)s/month, billed monthly', {
						args: {
							formattedCost,
						},
					} ),
					...accum,
				};
			}

			/* Translators: %(monthlyCost)s: monthly price formatted with currency */
			return {
				[ key ]: translate( '%(monthlyCost)s/month, billed yearly', {
					args: {
						monthlyCost: formattedCost,
					},
				} ),
				...accum,
			};
		}, {} );
	}, [ addOnPrices, translate ] );
};

export default useAddOnDisplayCost;
