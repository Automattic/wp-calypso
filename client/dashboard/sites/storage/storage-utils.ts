import { PRODUCT_1GB_SPACE, type Product, type Purchase } from '@automattic/api-core';

/**
 * Represents a storage tier option for the dropdown.
 */
export interface StorageTierOption {
	quantity: number;
	monthlyPrice: number;
	yearlyPrice: number;
	formattedMonthlyPrice: string;
	currencyCode: string;
}

/**
 * Gets the storage add-on product from the products list.
 */
export function getStorageAddOnProduct( products: Record< number, Product > ): Product {
	const storageProduct = Object.values( products ).find(
		( product ) => product.product_slug === PRODUCT_1GB_SPACE
	);

	if ( ! storageProduct ) {
		throw new Error( 'Storage add-on product not found' );
	}

	return storageProduct;
}

/**
 * Gets the currently purchased storage add-on from a list of purchases.
 */
export function getPurchasedStorageAddOn( purchases: Purchase[] ): Purchase | null {
	const storagePurchase = purchases.find(
		( purchase ) =>
			purchase.product_slug === PRODUCT_1GB_SPACE && purchase.subscription_status === 'active'
	);

	return storagePurchase ?? null;
}

/**
 * Calculates storage tier options from a storage product's price tier list.
 * Derives available tiers from the product's price_tier_list.
 */
export function getStorageTierOptions( product: Product ): StorageTierOption[] {
	const options: StorageTierOption[] = [];

	// For tiered pricing, use the maximum_units from each tier as the purchasable quantity
	// Filter out tiers without a maximum (usually the last open-ended tier)
	for ( const priceTier of product.price_tier_list ) {
		if ( priceTier.maximum_units && priceTier.maximum_price_monthly_display ) {
			const quantity = priceTier.maximum_units;
			const yearlyPrice = priceTier.maximum_price;
			const monthlyPrice = priceTier.maximum_price / 12;

			options.push( {
				quantity,
				monthlyPrice,
				yearlyPrice,
				formattedMonthlyPrice: priceTier.maximum_price_monthly_display,
				currencyCode: product.currency_code,
			} );
		}
	}

	// Sort by quantity ascending
	return options.sort( ( a, b ) => a.quantity - b.quantity );
}

/**
 * Gets the quantity of storage from a purchase (if it's a tiered product).
 */
export function getPurchasedStorageQuantity( purchase: Purchase | null ): number {
	if ( ! purchase ) {
		return 0;
	}

	// For tiered products, the quantity is stored in renewal_price_tier_usage_quantity
	return purchase.renewal_price_tier_usage_quantity ?? 0;
}

/**
 * Gets the yearly price for a specific storage tier quantity.
 * Returns 0 if the tier is not found.
 */
export function getStorageTierYearlyPrice(
	tierOptions: StorageTierOption[],
	quantity: number
): number {
	const tier = tierOptions.find( ( t ) => t.quantity === quantity );
	return tier?.yearlyPrice ?? 0;
}
