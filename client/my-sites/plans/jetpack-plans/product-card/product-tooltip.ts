import { JETPACK_SEARCH_PRODUCTS, getPriceTierForUnits } from '@automattic/calypso-products';
import { translate, TranslateResult } from 'i18n-calypso';
import { createElement } from 'react';
import ExternalLink from 'calypso/components/external-link';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import type { PriceTierEntry } from '@automattic/calypso-products';

/**
 * Gets tooltip for product.
 *
 * @param product Product to check.
 * @param tiers Product price tiers.
 */
export default function productTooltip(
	product: SelectorProduct,
	tiers: PriceTierEntry[]
): null | TranslateResult {
	if ( ! JETPACK_SEARCH_PRODUCTS.includes( product.productSlug ) ) {
		return null;
	}

	if ( tiers.length < 1 ) {
		return null;
	}

	const priceTier100 = getPriceTierForUnits( tiers, 1 );
	const priceTier1000 = getPriceTierForUnits( tiers, 101 );

	if ( ! priceTier100 || ! priceTier1000 ) {
		return null;
	}

	return translate(
		'{{p}}{{strong}}Pay only for what you need.{{/strong}}{{/p}}' +
			'{{p}}Up to 100 records %(price100)s{{br/}}' +
			'Up to 1,000 records %(price1000)s{{/p}}' +
			'{{Info}}More info{{/Info}}',
		{
			args: {
				price100: priceTier100.minimum_price_monthly_display,
				price1000: priceTier1000.minimum_price_monthly_display,
			},
			comment:
				'price100 = formatted price per 100 records, price1000 = formatted price per 1000 records. See https://jetpack.com/upgrade/search/.',
			components: {
				strong: createElement( 'strong' ),
				p: createElement( 'p' ),
				br: createElement( 'br' ),
				Info: createElement( ExternalLink, {
					icon: true,
					href: 'https://jetpack.com/upgrade/search/',
				} ),
			},
		}
	);
}
