import { isBigSkySupportedPlan } from '@automattic/calypso-products';
import { getSite } from 'calypso/state/sites/selectors';
import { getCurrentPlan } from '.';
import type { AppState } from 'calypso/types';

export default function isSiteBigSkyTrial( state: AppState, siteId: number ) {
	const site = getSite( state, siteId );
	if ( ! site ) {
		return false;
	}

	if (
		site.options?.site_creation_flow !== 'ai-site-builder' ||
		site.launch_status !== 'unlaunched'
	) {
		return false;
	}

	const currentPlan = getCurrentPlan( state, siteId );
	const productSlug = currentPlan?.productSlug || site?.plan?.product_slug;

	if ( ! productSlug ) {
		return true;
	}

	return ! isBigSkySupportedPlan( productSlug );
}
