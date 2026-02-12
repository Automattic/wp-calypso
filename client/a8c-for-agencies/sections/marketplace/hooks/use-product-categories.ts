import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { isWooCommerceProduct } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import { PRODUCT_TYPE_PRESSABLE_ADDON } from '../constants';
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
	BACKUP_STORAGE_FAMILY_SLUG,
	JETPACK_PACKS_FAMILY_SLUG,
} from '../lib/product-slugs';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

type CategoryConfig = {
	slugs: string[];
	familySlugs?: string[];
	label: string;
};

export function useProductCategories( product: APIProductFamilyProduct ): string[] {
	const translate = useTranslate();
	const { family_slug, slug } = product;

	return useMemo( () => {
		// Add e-commerce category for WooCommerce products
		const categories: string[] = isWooCommerceProduct( family_slug )
			? [ translate( 'e-commerce' ) ]
			: [];

		const CATEGORIES: CategoryConfig[] = [
			{
				slugs: SECURITY_PRODUCT_SLUGS,
				familySlugs: [ BACKUP_STORAGE_FAMILY_SLUG ],
				label: translate( 'security' ),
			},
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
			...CATEGORIES.reduce( ( acc: string[], { slugs, familySlugs, label } ) => {
				if ( slugs.includes( slug ) || familySlugs?.includes( family_slug ) ) {
					acc.push( label );
				}
				return acc;
			}, [] )
		);

		// Add product type categories
		if ( family_slug === JETPACK_PACKS_FAMILY_SLUG ) {
			categories.push( translate( 'bundle' ), translate( 'plan' ) );
		} else if ( family_slug === BACKUP_STORAGE_FAMILY_SLUG ) {
			categories.push( translate( 'add-on' ) );
		} else if ( family_slug === PRODUCT_TYPE_PRESSABLE_ADDON ) {
			categories.push( translate( 'hosting' ), translate( 'add-on' ) );
		} else if ( isProductType( family_slug ) ) {
			categories.push( translate( 'product' ) );
		} else if ( isWooCommerceProduct( family_slug ) ) {
			categories.push( translate( 'extension' ) );
		}

		return categories;
	}, [ family_slug, translate, slug ] );
}
