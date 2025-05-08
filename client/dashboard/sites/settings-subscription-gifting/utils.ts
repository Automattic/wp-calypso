import { WPCOM_FEATURES_SUBSCRIPTION_GIFTING } from '@automattic/calypso-products';
import { SiteFeatures } from '../../data/types';

export function hasSubscriptionGiftingFeature( features: SiteFeatures ) {
	return features.active.includes( WPCOM_FEATURES_SUBSCRIPTION_GIFTING );
}
