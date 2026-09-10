import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

export const TITAN_INBOX_MOCK_SLUG = 'pressable-addon-titan-inbox';

export function isTitanInboxMockProduct( product: Pick< APIProductFamilyProduct, 'slug' > ) {
	return product.slug === TITAN_INBOX_MOCK_SLUG;
}

export function getTitanInboxMockProduct(
	priceSource?: APIProductFamilyProduct
): APIProductFamilyProduct {
	const amount = '3.50';

	return {
		...priceSource,
		name: 'Pressable Titan Inbox Add-on: 1',
		slug: TITAN_INBOX_MOCK_SLUG,
		product_id: priceSource?.product_id ?? 999970,
		monthly_product_id: priceSource?.monthly_product_id ?? priceSource?.product_id ?? 999970,
		yearly_product_id: priceSource?.yearly_product_id ?? priceSource?.product_id ?? 999971,
		currency: priceSource?.currency ?? 'USD',
		amount,
		price_interval: 'month',
		price_per_unit: 350,
		price_per_unit_display: amount,
		family_slug: 'pressable-addon',
		supported_bundles: [ { quantity: 1, amount, price_per_unit: 350 } ],
		monthly_price: 3.5,
		yearly_price: 42,
	};
}
