import { useMemo } from '@wordpress/element';
import { type TranslateResult, useTranslate } from 'i18n-calypso';
import * as ProductsList from '../../products-list';
import { type AddOnPriceComponent, createAddOnPriceKey, useAddOnPrices } from './use-add-on-prices';

type AddOnDisplayCost = {
	[ key in string ]: TranslateResult;
};

const useAddOnDisplayCost = ( priceComps: AddOnPriceComponent[] ) => {
	const translate = useTranslate();
	const addOnPrices = useAddOnPrices( priceComps );
	const productSlugs = priceComps.map( ( { productSlug } ) => productSlug );
	const productsList = ProductsList.useProducts( productSlugs );

	return useMemo( () => {
		return priceComps.reduce< AddOnDisplayCost >( ( accum, priceComp ) => {
			const { productSlug } = priceComp;
			const product = productsList.data?.[ productSlug ];
			const key = createAddOnPriceKey( priceComp );
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
