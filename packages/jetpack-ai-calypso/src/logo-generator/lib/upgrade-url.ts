/**
 * Types
 */
import type { SiteDetails } from '@automattic/data-stores';

/**
 * Jetpack AI tiers are only sold for Jetpack-connected sites. A WordPress.com
 * Simple site gets Jetpack AI through a paid WordPress.com plan instead, so the
 * upgrade path for it is the plans page rather than a Jetpack AI checkout.
 */
export const isWpcomSimpleSite = ( siteDetails?: SiteDetails ): boolean =>
	!! siteDetails && ! siteDetails.jetpack;

export const getUpgradeURL = ( {
	siteDetails,
	nextTierSlug,
	redirectTo = location.href,
}: {
	siteDetails?: SiteDetails;
	nextTierSlug?: string;
	redirectTo?: string;
} ): string => {
	const upgradeURL = isWpcomSimpleSite( siteDetails )
		? new URL( `${ location.origin }/plans/${ siteDetails?.slug }` )
		: new URL( `${ location.origin }/checkout/${ siteDetails?.domain }/${ nextTierSlug }` );

	upgradeURL.searchParams.set( 'redirect_to', redirectTo );

	return upgradeURL.toString();
};
