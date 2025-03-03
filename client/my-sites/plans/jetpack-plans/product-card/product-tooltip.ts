import {
	JETPACK_SEARCH_PRODUCTS,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
	getPriceTierForUnits,
} from '@automattic/calypso-products';
import { ExternalLink } from '@automattic/components';
import { formatCurrency, translate, TranslateResult } from 'i18n-calypso';
import { createElement } from 'react';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import type { PriceTierEntry } from '@automattic/calypso-products';

/**
 * Gets tooltip for product.
 * @param product Product to check.
 * @param tiers Product price tiers.
 * @param currencyCode Currency code for user.
 */
export default function productTooltip(
	product: SelectorProduct,
	tiers: PriceTierEntry[],
	currencyCode: string
): null | TranslateResult {
	if ( ! ( JETPACK_SEARCH_PRODUCTS as ReadonlyArray< string > ).includes( product.productSlug ) ) {
		return null;
	}

	if ( tiers.length < 1 ) {
		return null;
	}

	const priceTier = getPriceTierForUnits( tiers, 1 );

	if (
		! priceTier ||
		! currencyCode ||
		! priceTier.per_unit_fee ||
		! priceTier.transform_quantity_divide_by
	) {
		return null;
	}

	let per_unit_monthly_fee = priceTier.per_unit_fee;
	if (
		product.productSlug !== PRODUCT_JETPACK_SEARCH_MONTHLY &&
		product.productSlug !== PRODUCT_WPCOM_SEARCH_MONTHLY
	) {
		per_unit_monthly_fee = priceTier.per_unit_fee / 12;
	}

	return translate(
		'{{p}}{{strong}}Pay only for what you need.{{/strong}}{{/p}}' +
			'{{p}}%(price)s per every additional %(thousands_of_records)dk records and/or requests per month{{/p}}' +
			'{{Info}}More info{{/Info}}',
		{
			args: {
				price: formatCurrency( per_unit_monthly_fee, currencyCode, { isSmallestUnit: true } ),
				thousands_of_records: priceTier.transform_quantity_divide_by / 1000,
			},
			comment:
				'price = formatted price per given number of records. thousands_of_records = number of records divided by 1000 (hence the k after it) See https://jetpack.com/upgrade/search/.',
			components: {
				strong: createElement( 'strong' ),
				p: createElement( 'p' ),
				Info: createElement( ExternalLink, {
					icon: true,
					href: 'https://jetpack.com/upgrade/search/',
				} ),
			},
		}
	);
}
