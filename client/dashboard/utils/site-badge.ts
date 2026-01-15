import { isSitePlanTrial } from '../sites/plans';
import { getSiteStatus } from './site-status';
import { isP2 } from './site-types';
import type { Site, SiteBadge } from '@automattic/api-core';

export function getSiteBadge( site: Site ): SiteBadge {
	const status = getSiteStatus( site );
	if ( status ) {
		return status;
	}

	if ( site.is_wpcom_staging_site ) {
		return 'staging';
	}
	if ( isSitePlanTrial( site ) ) {
		return 'trial';
	}
	if ( isP2( site ) ) {
		return 'p2';
	}

	return null;
}
