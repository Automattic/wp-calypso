import {
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_NO_ADS,
	WPCOM_FEATURES_PREMIUM_THEMES,
	WPCOM_FEATURES_CUSTOM_DESIGN,
	WPCOM_FEATURES_NO_ADVERTS,
} from '@automattic/calypso-products';

/**
 * Return the feature slug relevant to a given product.
 * (features do/need not reflect products, in principle)
 */
const getFeatureSlug = ( productSlug: string ) => {
	switch ( productSlug ) {
		case PRODUCT_WPCOM_UNLIMITED_THEMES:
			return WPCOM_FEATURES_PREMIUM_THEMES;
		case PRODUCT_WPCOM_CUSTOM_DESIGN:
			return WPCOM_FEATURES_CUSTOM_DESIGN;
		case PRODUCT_NO_ADS:
			return WPCOM_FEATURES_NO_ADVERTS;
		default:
			return null;
	}
};

export default getFeatureSlug;
