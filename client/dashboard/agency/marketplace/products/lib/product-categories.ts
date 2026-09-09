import { __ } from '@wordpress/i18n';
import {
	BACKUP_STORAGE_FAMILY_SLUG,
	CONVERSION_PRODUCT_SLUGS,
	CUSTOMER_SERVICE_PRODUCT_SLUGS,
	GROWTH_PRODUCT_SLUGS,
	JETPACK_PACKS_FAMILY_SLUG,
	MERCHANDISING_PRODUCT_SLUGS,
	PAYMENTS_PRODUCT_SLUGS,
	PERFORMANCE_PRODUCT_SLUGS,
	PRESSABLE_ADDON_FAMILY_SLUG,
	SECURITY_PRODUCT_SLUGS,
	SHIPPING_DELIVERY_FULFILLMENT_PRODUCT_SLUGS,
	SOCIAL_PRODUCT_SLUGS,
	STORE_CONTENT_PRODUCT_SLUGS,
	STORE_MANAGEMENT_PRODUCT_SLUGS,
} from './product-slugs';
import type { AgencyProduct } from '@automattic/api-core';

export type ProductBrand = 'jetpack' | 'woocommerce' | 'pressable';

export type ProductType = 'plan' | 'product' | 'add-on' | 'extension';

export type ProductCategory =
	| 'payments'
	| 'security'
	| 'performance'
	| 'social'
	| 'growth'
	| 'shipping'
	| 'conversion'
	| 'customer-service'
	| 'merchandising'
	| 'store-content'
	| 'store-management';

const CATEGORY_SLUGS: Record< ProductCategory, string[] > = {
	payments: PAYMENTS_PRODUCT_SLUGS,
	security: SECURITY_PRODUCT_SLUGS,
	performance: PERFORMANCE_PRODUCT_SLUGS,
	social: SOCIAL_PRODUCT_SLUGS,
	growth: GROWTH_PRODUCT_SLUGS,
	shipping: SHIPPING_DELIVERY_FULFILLMENT_PRODUCT_SLUGS,
	conversion: CONVERSION_PRODUCT_SLUGS,
	'customer-service': CUSTOMER_SERVICE_PRODUCT_SLUGS,
	merchandising: MERCHANDISING_PRODUCT_SLUGS,
	'store-content': STORE_CONTENT_PRODUCT_SLUGS,
	'store-management': STORE_MANAGEMENT_PRODUCT_SLUGS,
};

export const getCategoryLabels = (): Record< ProductCategory, string > => ( {
	payments: __( 'Payments' ),
	security: __( 'Security' ),
	performance: __( 'Performance' ),
	social: __( 'Social' ),
	growth: __( 'Growth' ),
	shipping: __( 'Shipping, delivery, and fulfillment' ),
	conversion: __( 'Conversion' ),
	'customer-service': __( 'Customer service' ),
	merchandising: __( 'Merchandising' ),
	'store-content': __( 'Store content and customization' ),
	'store-management': __( 'Store management' ),
} );

export const getCategoryShortLabels = (): Record< ProductCategory, string > => ( {
	...getCategoryLabels(),
	shipping: __( 'Shipping' ),
	'store-content': __( 'Store content' ),
} );

export const getBrandLabels = (): Record< ProductBrand, string > => ( {
	jetpack: __( 'Jetpack' ),
	woocommerce: __( 'WooCommerce' ),
	pressable: __( 'Pressable' ),
} );

export const getTypeLabels = (): Record< ProductType, string > => ( {
	extension: __( 'Extension' ),
	plan: __( 'Plan' ),
	product: __( 'Product' ),
	'add-on': __( 'Add-on' ),
} );

export const isWooCommerceProduct = ( product: AgencyProduct ) =>
	product.family_slug.startsWith( 'woocommerce' );

export const isPressableAddon = ( product: AgencyProduct ) =>
	product.family_slug === PRESSABLE_ADDON_FAMILY_SLUG;

export function getProductBrand( product: AgencyProduct ): ProductBrand {
	if ( isWooCommerceProduct( product ) ) {
		return 'woocommerce';
	}
	if ( isPressableAddon( product ) ) {
		return 'pressable';
	}
	return 'jetpack';
}

export function getProductType( product: AgencyProduct ): ProductType {
	if ( product.family_slug === JETPACK_PACKS_FAMILY_SLUG ) {
		return 'plan';
	}
	if ( product.family_slug === BACKUP_STORAGE_FAMILY_SLUG || isPressableAddon( product ) ) {
		return 'add-on';
	}
	if ( isWooCommerceProduct( product ) ) {
		return 'extension';
	}
	return 'product';
}

export function getProductCategories( product: AgencyProduct ): ProductCategory[] {
	return ( Object.keys( CATEGORY_SLUGS ) as ProductCategory[] ).filter( ( category ) => {
		if ( category === 'security' && product.family_slug === BACKUP_STORAGE_FAMILY_SLUG ) {
			return true;
		}
		return CATEGORY_SLUGS[ category ].includes( product.slug );
	} );
}

// The labels the classic dashboard shows as badges on a product card.
export function getProductBadgeLabels( product: AgencyProduct ): string[] {
	const categoryLabels = getCategoryShortLabels();
	const labels = getProductCategories( product ).map( ( category ) => categoryLabels[ category ] );

	if ( product.family_slug === JETPACK_PACKS_FAMILY_SLUG ) {
		labels.push( __( 'Bundle' ), __( 'Plan' ) );
	} else if ( isPressableAddon( product ) ) {
		labels.push( __( 'Hosting' ), __( 'Add-on' ) );
	} else {
		labels.push( getTypeLabels()[ getProductType( product ) ] );
	}

	return labels;
}
