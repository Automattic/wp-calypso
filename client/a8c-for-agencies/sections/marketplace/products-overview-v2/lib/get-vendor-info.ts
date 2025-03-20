import { VendorInfo } from 'calypso/components/jetpack/jetpack-lightbox/types';

const VENDOR_INFO_MAP: Record< string, VendorInfo > = {
	kestrel: {
		vendorName: 'Kestrel',
		vendorUrl: 'https://woocommerce.com/vendor/kestrel/',
	},
	'element-stark': {
		vendorName: 'Element Stark',
		vendorUrl: 'https://woocommerce.com/vendor/element-stark/',
	},
	storeapps: {
		vendorName: 'StoreApps',
		vendorUrl: 'https://woocommerce.com/vendor/storeapps/',
	},
	woocommerce: {
		vendorName: 'Woo',
		vendorUrl: 'https://woocommerce.com/',
	},
	jetpack: {
		vendorName: 'Jetpack',
		vendorUrl: 'https://jetpack.com/',
	},
};

const THIRD_PARTY_PRODUCT_MAP: Record< string, string > = {
	'woocommerce-constellation': 'kestrel',
	'woocommerce-dynamic-pricing': 'element-stark',
	'woocommerce-rental-products': 'kestrel',
	'woocommerce-smart-coupons': 'storeapps',
	'woocommerce-variation-swatches-and-photos': 'element-stark',
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

	return null;
};
