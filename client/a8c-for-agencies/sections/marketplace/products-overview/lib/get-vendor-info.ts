import { VendorInfo } from 'calypso/components/jetpack/jetpack-lightbox/types';

const VENDOR_INFO_MAP: Record< string, VendorInfo > = {
	kestrel: {
		vendorSlug: 'kestrel',
		vendorName: 'Kestrel',
		vendorUrl: 'https://woocommerce.com/vendor/kestrel/',
	},
	'element-stark': {
		vendorSlug: 'element-stark',
		vendorName: 'Element Stark',
		vendorUrl: 'https://woocommerce.com/vendor/element-stark/',
	},
	storeapps: {
		vendorSlug: 'storeapps',
		vendorName: 'StoreApps',
		vendorUrl: 'https://woocommerce.com/vendor/storeapps/',
	},
	afterpay: {
		vendorSlug: 'afterpay',
		vendorName: 'Afterpay',
		vendorUrl: 'https://woocommerce.com/vendor/afterpay/',
	},
	affirm: {
		vendorSlug: 'affirm',
		vendorName: 'Affirm',
		vendorUrl: 'https://woocommerce.com/vendor/affirm/',
	},
	mollie: {
		vendorSlug: 'mollie',
		vendorName: 'Mollie',
		vendorUrl: 'https://woocommerce.com/vendor/mollie/',
	},
	stripe: {
		vendorSlug: 'stripe',
		vendorName: 'Stripe',
		vendorUrl: 'https://woocommerce.com/vendor/stripe/',
	},
	klarna: {
		vendorSlug: 'klarna',
		vendorName: 'Klarna',
		vendorUrl: 'https://woocommerce.com/vendor/klarna/',
	},
	paypal: {
		vendorSlug: 'paypal',
		vendorName: 'PayPal',
		vendorUrl: 'https://woocommerce.com/vendor/paypal/',
	},
	klaviyo: {
		vendorSlug: 'klaviyo',
		vendorName: 'Klaviyo',
		vendorUrl: 'https://woocommerce.com/vendor/klaviyo/',
	},
	woocommerce: {
		vendorSlug: 'woocommerce',
		vendorName: 'Woo',
		vendorUrl: 'https://woocommerce.com/',
	},
	jetpack: {
		vendorSlug: 'jetpack',
		vendorName: 'Jetpack',
		vendorUrl: 'https://jetpack.com/',
	},
	pressable: {
		vendorSlug: 'pressable',
		vendorName: 'Pressable',
		vendorUrl: 'https://pressable.com/',
	},
	wpcom: {
		vendorSlug: 'wpcom',
		vendorName: 'WordPress.com',
		vendorUrl: 'https://wordpress.com/',
	},
};

const THIRD_PARTY_PRODUCT_MAP: Record< string, string > = {
	'woocommerce-constellation': 'kestrel',
	'woocommerce-dynamic-pricing': 'element-stark',
	'woocommerce-rental-products': 'kestrel',
	'woocommerce-smart-coupons': 'storeapps',
	'woocommerce-variation-swatches-and-photos': 'element-stark',
	'woocommerce-afterpay': 'afterpay',
	'woocommerce-affirm': 'affirm',
	'woocommerce-mollie': 'mollie',
	'woocommerce-stripe': 'stripe',
	'woocommerce-klarna': 'klarna',
	'woocommerce-paypal': 'paypal',
	'woocommerce-klaviyo': 'klaviyo',
};

export const getVendorInfo = ( productSlug: string ) => {
	const thirdPartyVendor = THIRD_PARTY_PRODUCT_MAP[ productSlug ];

	if ( thirdPartyVendor ) {
		return VENDOR_INFO_MAP[ thirdPartyVendor ];
	}

	if ( productSlug.startsWith( 'woocommerce-' ) ) {
		return VENDOR_INFO_MAP[ 'woocommerce' ];
	}

	if ( productSlug.startsWith( 'jetpack-' ) ) {
		return VENDOR_INFO_MAP[ 'jetpack' ];
	}

	if ( productSlug.startsWith( 'wpcom-' ) ) {
		return VENDOR_INFO_MAP[ 'wpcom' ];
	}

	if ( productSlug.startsWith( 'pressable-' ) ) {
		return VENDOR_INFO_MAP[ 'pressable' ];
	}

	return null;
};
