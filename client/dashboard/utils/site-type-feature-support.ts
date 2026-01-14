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
	| 'emails'
	| 'settings';

export type SiteTypeFeatureSupports = Record< SiteTypeFeature, boolean >;

/**
 * Returns a complete map of which features are supported for a given site type.
 *
 * This is about structural site type (Commerce Garden, Jetpack-connected, etc.),
 * NOT about plan features. Plan-based feature checks (hasHostingFeature) should
 * be used within routes to gate content, show upsells, etc.
 */
export function getSiteTypeFeatureSupports( site: Site ): SiteTypeFeatureSupports {
	if ( isSelfHostedJetpackConnected( site ) ) {
		return {
			deployments: false,
			performance: false,
			monitoring: false,
			logs: false,
			backups: false,
			scan: false,
			domains: false,
			emails: false,
			settings: false,
		};
	}

	if ( isCommerceGarden( site ) ) {
		return {
			deployments: false,
			performance: false,
			monitoring: false,
			logs: false,
			backups: false,
			scan: false,
			domains: true,
			emails: true,
			settings: true,
		};
	}

	return {
		deployments: true,
		performance: true,
		monitoring: true,
		logs: true,
		backups: true,
		scan: true,
		domains: true,
		emails: true,
		settings: true,
	};
}

/**
 * Determines if a site type supports a specific feature.
 */
export function siteTypeSupportsFeature( site: Site, feature: SiteTypeFeature ): boolean {
	return getSiteTypeFeatureSupports( site )[ feature ];
}
