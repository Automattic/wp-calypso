import {
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_NO_ADS,
	WPCOM_FEATURES_PREMIUM_THEMES,
	WPCOM_FEATURES_CUSTOM_DESIGN,
	WPCOM_FEATURES_NO_ADVERTS,
	PRODUCT_WPCOM_10_GB_STORAGE,
	FEATURE_1GB_STORAGE,
} from '@automattic/calypso-products';

/**
 * Returns any relevant feature slugs for a given add-on.
 * Add-ons are currently uniquely identified by their product slugs.
 */
const useAddOnFeatureSlugs = ( addOnProductSlug: string ): string[] | null => {
	switch ( addOnProductSlug ) {
		case PRODUCT_WPCOM_UNLIMITED_THEMES:
			return [ WPCOM_FEATURES_PREMIUM_THEMES ];
		case PRODUCT_WPCOM_CUSTOM_DESIGN:
			return [ WPCOM_FEATURES_CUSTOM_DESIGN ];
		case PRODUCT_NO_ADS:
			return [ WPCOM_FEATURES_NO_ADVERTS ];
		case PRODUCT_WPCOM_10_GB_STORAGE:
			return [ FEATURE_1GB_STORAGE ];
		default:
			return null;
	}
};

export default useAddOnFeatureSlugs;
