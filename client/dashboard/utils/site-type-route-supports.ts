import { isCommerceGarden, isSelfHostedJetpackConnected } from './site-types';
import type { Site } from '@automattic/api-core';

/**
 * Features that can be gated based on site type.
 * This determines route availability, not feature availability within routes.
 */
export type SiteTypeFeature =
	| 'deployments'
	| 'performance'
	| 'monitoring'
	| 'logs'
	| 'backups'
	| 'scan'
	| 'domains'
	| 'emails';

export type SiteTypeFeatureSupports = Record< SiteTypeFeature, boolean >;

/**
 * Returns a complete map of which features are supported for a given site type.
 *
 * This is about structural site type (Commerce Garden, Jetpack-connected, etc.),
 * NOT about plan features. Plan-based feature checks (hasHostingFeature) should
 * be used within routes to gate content, show upsells, etc.
 */
export function getSiteTypeFeatureSupports( site: Site ): SiteTypeFeatureSupports {
	const isHosted = ! isCommerceGarden( site ) && ! isSelfHostedJetpackConnected( site );

	return {
		deployments: isHosted,
		performance: isHosted,
		monitoring: isHosted,
		logs: isHosted,
		backups: isHosted,
		scan: isHosted,
		domains: true,
		emails: ! isSelfHostedJetpackConnected( site ),
	};
}

/**
 * Determines if a site type supports a specific feature.
 */
export function siteTypeSupportsFeature( site: Site, feature: SiteTypeFeature ): boolean {
	return getSiteTypeFeatureSupports( site )[ feature ];
}
