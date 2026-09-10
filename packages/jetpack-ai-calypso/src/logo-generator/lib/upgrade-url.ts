/**
 * Types
 */
import type { SiteDetails } from '@automattic/data-stores';

export type UpgradeReason = 'feature' | 'requests';

export const isWpcomSimpleSite = ( siteDetails?: SiteDetails ): boolean =>
	!! siteDetails && ! siteDetails.jetpack;

/**
 * A WordPress.com Simple site without the feature gets Jetpack AI through a paid
 * WordPress.com plan, not a Jetpack AI tier, so it upgrades on the plans page.
 */
export const shouldUpgradePlan = ( siteDetails?: SiteDetails, reason?: UpgradeReason ): boolean =>
	reason === 'feature' && isWpcomSimpleSite( siteDetails );

export const getUpgradeURL = ( {
	siteDetails,
	nextTierSlug,
	reason,
	redirectTo = location.href,
}: {
	siteDetails?: SiteDetails;
	nextTierSlug?: string;
	reason: UpgradeReason;
	redirectTo?: string;
} ): string => {
	const upgradeURL = shouldUpgradePlan( siteDetails, reason )
		? new URL( `${ location.origin }/plans/${ siteDetails?.slug }` )
		: new URL( `${ location.origin }/checkout/${ siteDetails?.domain }/${ nextTierSlug }` );

	upgradeURL.searchParams.set( 'redirect_to', redirectTo );

	return upgradeURL.toString();
};
