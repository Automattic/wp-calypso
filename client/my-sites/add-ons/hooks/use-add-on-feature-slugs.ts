import {
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_NO_ADS,
	WPCOM_FEATURES_PREMIUM_THEMES,
	WPCOM_FEATURES_CUSTOM_DESIGN,
	WPCOM_FEATURES_NO_ADVERTS,
} from '@automattic/calypso-products';

/**
 * Returns any relevant feature slugs for a given add-on.
 * Add-ons are currently uniquely identified by their product slugs.
 */
const useAddOnFeatureSlugs = ( addOnProductSlug: string ) => {
	switch ( addOnProductSlug ) {
		case PRODUCT_WPCOM_UNLIMITED_THEMES:
			return [ WPCOM_FEATURES_PREMIUM_THEMES ];
		case PRODUCT_WPCOM_CUSTOM_DESIGN:
			return [ WPCOM_FEATURES_CUSTOM_DESIGN ];
		case PRODUCT_NO_ADS:
			return [ WPCOM_FEATURES_NO_ADVERTS ];
		default:
			return null;
	}
};

export default useAddOnFeatureSlugs;
