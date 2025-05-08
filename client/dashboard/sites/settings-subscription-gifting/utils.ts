import { DotcomFeatures } from '../../data/constants';
import { Site } from '../../data/types';

export function hasSubscriptionGiftingFeature( site: Site ) {
	if ( ! site.plan ) {
		return false;
	}
	return site.plan.features.active.includes( DotcomFeatures.SUBSCRIPTION_GIFTING );
}
