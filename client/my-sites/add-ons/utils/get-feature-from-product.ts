import {
	WPCOM_FEATURES_UNLIMITED_THEMES,
	WPCOM_FEATURES_PREMIUM_THEMES,
} from '@automattic/calypso-products';

/** Sometimes features slugs don't map directly to product slugs. */
const getFeatureFromProduct = ( productSlug: string ) => {
	if ( WPCOM_FEATURES_UNLIMITED_THEMES === productSlug ) {
		return WPCOM_FEATURES_PREMIUM_THEMES;
	}

	return productSlug;
};

export default getFeatureFromProduct;
