import { DotcomFeatures } from '../../data/constants';
import { SiteFeatures } from '../../data/types';

export function hasSubscriptionGiftingFeature( features: SiteFeatures ) {
	return features.active.includes( DotcomFeatures.SUBSCRIPTION_GIFTING );
}
