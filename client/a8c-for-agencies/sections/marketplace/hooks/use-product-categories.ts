import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { isWooCommerceProduct } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { isProductType } from '../lib/product-filter';
import {
	SECURITY_PRODUCT_SLUGS,
	PERFORMANCE_PRODUCT_SLUGS,
	SOCIAL_PRODUCT_SLUGS,
	GROWTH_PRODUCT_SLUGS,
	PAYMENTS_PRODUCT_SLUGS,
	SHIPPING_DELIVERY_FULFILLMENT_PRODUCT_SLUGS,
	CONVERSION_PRODUCT_SLUGS,
	CUSTOMER_SERVICE_PRODUCT_SLUGS,
	MERCHANDISING_PRODUCT_SLUGS,
	STORE_CONTENT_PRODUCT_SLUGS,
	STORE_MANAGEMENT_PRODUCT_SLUGS,
} from '../lib/product-slugs';

type CategoryConfig = {
	slugs: string[];
	label: string;
};

export function useProductCategories( product: APIProductFamilyProduct ): string[] {
	const translate = useTranslate();
	const { family_slug } = product;

	return useMemo( () => {
		// Add e-commerce category for WooCommerce products
		const categories: string[] = isWooCommerceProduct( family_slug )
			? [ translate( 'e-commerce' ) ]
			: [];

		const CATEGORIES: CategoryConfig[] = [
			{ slugs: SECURITY_PRODUCT_SLUGS, label: translate( 'security' ) },
			{ slugs: PERFORMANCE_PRODUCT_SLUGS, label: translate( 'performance' ) },
			{ slugs: SOCIAL_PRODUCT_SLUGS, label: translate( 'social' ) },
			{ slugs: GROWTH_PRODUCT_SLUGS, label: translate( 'growth' ) },
			{ slugs: PAYMENTS_PRODUCT_SLUGS, label: translate( 'payments' ) },
			{ slugs: SHIPPING_DELIVERY_FULFILLMENT_PRODUCT_SLUGS, label: translate( 'shipping' ) },
			{ slugs: CONVERSION_PRODUCT_SLUGS, label: translate( 'conversion' ) },
			{ slugs: CUSTOMER_SERVICE_PRODUCT_SLUGS, label: translate( 'customer service' ) },
			{ slugs: MERCHANDISING_PRODUCT_SLUGS, label: translate( 'merchandising' ) },
			{ slugs: STORE_CONTENT_PRODUCT_SLUGS, label: translate( 'store content' ) },
			{ slugs: STORE_MANAGEMENT_PRODUCT_SLUGS, label: translate( 'store management' ) },
		];

		// Add regular categories
		categories.push(
			...CATEGORIES.reduce( ( acc: string[], { slugs, label } ) => {
				if ( slugs.includes( family_slug ) ) {
					acc.push( label );
				}
				return acc;
			}, [] )
		);

		// Add product type categories
		if ( family_slug === 'jetpack-packs' ) {
			categories.push( translate( 'bundle' ), translate( 'plan' ) );
		} else if ( family_slug === 'jetpack-backup-storage' ) {
			categories.push( translate( 'add-on' ) );
		} else if ( isProductType( family_slug ) ) {
			categories.push( translate( 'product' ) );
		} else if ( isWooCommerceProduct( family_slug ) ) {
			categories.push( translate( 'extension' ) );
		}

		return categories;
	}, [ family_slug, translate ] );
}
