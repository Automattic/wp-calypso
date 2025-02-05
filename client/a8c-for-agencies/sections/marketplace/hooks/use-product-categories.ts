import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { isWooCommerceProduct } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { isProductType } from '../lib/product-filter';
import {
	securityProductSlugs,
	performanceProductSlugs,
	socialProductSlugs,
	growthProductSlugs,
	paymentsProductSlugs,
	shippingDeliveryFulfillmentProductSlugs,
	conversionProductSlugs,
	customerServiceProductSlugs,
	merchandisingProductSlugs,
	storeContentProductSlugs,
	storeManagementProductSlugs,
} from '../lib/product-slugs';

type CategoryConfig = {
	slugs: string[];
	label: string;
};

const JETPACK_COMPLETE_SLUGS = [
	...securityProductSlugs,
	...performanceProductSlugs,
	...socialProductSlugs,
	...growthProductSlugs,
];

export function useProductCategories( product: APIProductFamilyProduct ): string[] {
	const translate = useTranslate();
	const { family_slug, slug } = product;

	return useMemo( () => {
		// Add e-commerce category for WooCommerce products
		const categories: string[] = isWooCommerceProduct( family_slug )
			? [ translate( 'e-commerce' ) ]
			: [];

		const CATEGORIES: CategoryConfig[] = [
			{ slugs: securityProductSlugs, label: translate( 'security' ) },
			{ slugs: performanceProductSlugs, label: translate( 'performance' ) },
			{ slugs: socialProductSlugs, label: translate( 'social' ) },
			{ slugs: growthProductSlugs, label: translate( 'growth' ) },
			{ slugs: paymentsProductSlugs, label: translate( 'payments' ) },
			{ slugs: shippingDeliveryFulfillmentProductSlugs, label: translate( 'shipping' ) },
			{ slugs: conversionProductSlugs, label: translate( 'conversion' ) },
			{ slugs: customerServiceProductSlugs, label: translate( 'customer service' ) },
			{ slugs: merchandisingProductSlugs, label: translate( 'merchandising' ) },
			{ slugs: storeContentProductSlugs, label: translate( 'store content' ) },
			{ slugs: storeManagementProductSlugs, label: translate( 'store management' ) },
		];

		// Add regular categories
		categories.push(
			...CATEGORIES.reduce( ( acc: string[], { slugs, label } ) => {
				if (
					slugs.includes( family_slug ) ||
					( slug === 'jetpack-complete' && JETPACK_COMPLETE_SLUGS.includes( family_slug ) )
				) {
					acc.push( label );
				}
				return acc;
			}, [] )
		);

		// Add product type categories
		if ( family_slug === 'jetpack-packs' ) {
			categories.push( translate( 'plan' ) );
		} else if ( family_slug === 'jetpack-backup-storage' ) {
			categories.push( translate( 'add-on' ) );
		} else if ( isProductType( family_slug ) ) {
			categories.push( translate( 'product' ) );
		} else if ( isWooCommerceProduct( family_slug ) ) {
			categories.push( translate( 'extension' ) );
		}

		return categories;
	}, [ family_slug, slug, translate ] );
}
