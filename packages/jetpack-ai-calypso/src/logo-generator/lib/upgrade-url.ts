/**
 * Types
 */
import type { SiteDetails } from '@automattic/data-stores';

/**
 * A WordPress.com Simple site gets Jetpack AI, with unlimited logo generation,
 * through a paid WordPress.com plan rather than a Jetpack AI tier, so it upgrades
 * on the plans page instead of the Jetpack AI checkout.
 */
export const isWpcomSimpleSite = ( siteDetails?: SiteDetails ): boolean =>
	!! siteDetails && ! siteDetails.jetpack;

export const getUpgradeURL = ( {
	siteDetails,
	nextTierSlug,
}: {
	siteDetails?: SiteDetails;
	nextTierSlug?: string;
} ): string => {
	const upgradeURL = isWpcomSimpleSite( siteDetails )
		? new URL( `${ location.origin }/plans/${ siteDetails?.slug }` )
		: new URL( `${ location.origin }/checkout/${ siteDetails?.domain }/${ nextTierSlug }` );

	upgradeURL.searchParams.set( 'redirect_to', location.href );

	return upgradeURL.toString();
};
