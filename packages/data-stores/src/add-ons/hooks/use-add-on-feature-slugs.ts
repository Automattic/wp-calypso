import {
	PRODUCT_WPCOM_UNLIMITED_THEMES,
	PRODUCT_WPCOM_CUSTOM_DESIGN,
	PRODUCT_NO_ADS,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	WPCOM_FEATURES_CUSTOM_DESIGN,
	WPCOM_FEATURES_NO_ADVERTS,
	FEATURE_50GB_STORAGE_ADD_ON,
	FEATURE_100GB_STORAGE_ADD_ON,
	PRODUCT_1GB_SPACE,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';

/**
 * Returns any relevant feature slugs for a given add-on.
 * Add-ons are currently uniquely identified by their product slugs.
 */
const useAddOnFeatureSlugs = ( addOnProductSlug: string, quantity?: number ) => {
	return useMemo( () => {
		switch ( addOnProductSlug ) {
			case PRODUCT_WPCOM_UNLIMITED_THEMES:
				return [ WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ];
			case PRODUCT_WPCOM_CUSTOM_DESIGN:
				return [ WPCOM_FEATURES_CUSTOM_DESIGN ];
			case PRODUCT_NO_ADS:
				return [ WPCOM_FEATURES_NO_ADVERTS ];
			case PRODUCT_1GB_SPACE:
				if ( quantity === 50 ) {
					return [ FEATURE_50GB_STORAGE_ADD_ON ];
				} else if ( quantity === 100 ) {
					return [ FEATURE_100GB_STORAGE_ADD_ON ];
				}
			default:
				return null;
		}
	}, [ addOnProductSlug, quantity ] ); // add dependencies
};

export default useAddOnFeatureSlugs;
