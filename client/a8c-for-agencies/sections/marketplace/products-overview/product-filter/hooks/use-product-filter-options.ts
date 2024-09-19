import { useTranslate } from 'i18n-calypso';
import {
	PRODUCT_CATEGORY_CONVERSION,
	PRODUCT_CATEGORY_CUSTOMER_SERVICE,
	PRODUCT_CATEGORY_GROWTH,
	PRODUCT_CATEGORY_MERCHANDISING,
	PRODUCT_CATEGORY_PAYMENTS,
	PRODUCT_CATEGORY_PERFORMANCE,
	PRODUCT_CATEGORY_SECURITY,
	PRODUCT_CATEGORY_SHIPPING_DELIVERY_FULFILLMENT,
	PRODUCT_CATEGORY_SOCIAL,
	PRODUCT_CATEGORY_STORE_CONTENT,
	PRODUCT_CATEGORY_STORE_MANAGEMENT,
	PRODUCT_FILTER_KEY_CATEGORIES,
	PRODUCT_FILTER_KEY_PRICES,
	PRODUCT_FILTER_KEY_TYPES,
	PRODUCT_PRICE_FREE,
	PRODUCT_PRICE_PAID,
	PRODUCT_TYPE_ADDON,
	PRODUCT_TYPE_EXTENSION,
	PRODUCT_TYPE_PLAN,
	PRODUCT_TYPE_PRODUCT,
} from '../../../constants';

export default function useProductFilterOptions() {
	const translate = useTranslate();

	return {
		[ PRODUCT_FILTER_KEY_CATEGORIES ]: [
			{ key: PRODUCT_CATEGORY_SECURITY, label: translate( 'Security' ) as string },
			{ key: PRODUCT_CATEGORY_PERFORMANCE, label: translate( 'Performance' ) as string },
			{ key: PRODUCT_CATEGORY_SOCIAL, label: translate( 'Social' ) as string },
			{ key: PRODUCT_CATEGORY_GROWTH, label: translate( 'Growth' ) as string },
			{ key: PRODUCT_CATEGORY_PAYMENTS, label: translate( 'Payments' ) as string },
			{
				key: PRODUCT_CATEGORY_SHIPPING_DELIVERY_FULFILLMENT,
				label: translate( 'Shipping, Delivery, and Fulfillment' ) as string,
			},
			{ key: PRODUCT_CATEGORY_CONVERSION, label: translate( 'Conversion' ) as string },
			{ key: PRODUCT_CATEGORY_CUSTOMER_SERVICE, label: translate( 'Customer Service' ) as string },
			{ key: PRODUCT_CATEGORY_MERCHANDISING, label: translate( 'Merchandising' ) as string },
			{
				key: PRODUCT_CATEGORY_STORE_CONTENT,
				label: translate( 'Store Content and Customization' ) as string,
			},
			{ key: PRODUCT_CATEGORY_STORE_MANAGEMENT, label: translate( 'Store Management' ) as string },
		],
		[ PRODUCT_FILTER_KEY_TYPES ]: [
			{ key: PRODUCT_TYPE_EXTENSION, label: translate( 'Extension' ) as string },
			{ key: PRODUCT_TYPE_PLAN, label: translate( 'Plan' ) as string },
			{ key: PRODUCT_TYPE_PRODUCT, label: translate( 'Product' ) as string },
			{ key: PRODUCT_TYPE_ADDON, label: translate( 'Add-on' ) as string },
		],
		[ PRODUCT_FILTER_KEY_PRICES ]: [
			{ key: PRODUCT_PRICE_FREE, label: translate( 'Free' ) as string },
			{
				key: PRODUCT_PRICE_PAID,
				label: translate( 'Paid', { context: 'Label for a paid subscription plan' } ) as string,
			},
		],
	};
}
