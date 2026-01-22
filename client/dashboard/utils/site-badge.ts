import { isSitePlanTrial } from '../sites/plans';
import { getSiteBlockingStatus } from './site-status';
import { isP2 } from './site-types';
import type { Site } from '@automattic/api-core';

export type SiteBlockingStatus =
	| 'deleted'
	| 'migration_pending'
	| 'migration_started'
	| 'difm_lite_in_progress'
	| null;

export type SiteBadge = 'staging' | 'trial' | 'p2' | SiteBlockingStatus;

export function getSiteBadge( site: Site ): SiteBadge {
	const status = getSiteBlockingStatus( site );
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
