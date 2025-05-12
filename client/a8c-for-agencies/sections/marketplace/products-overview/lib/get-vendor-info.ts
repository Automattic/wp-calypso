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
