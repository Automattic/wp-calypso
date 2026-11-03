import { DotcomFeatures, HostingFeatures } from '@automattic/api-core';
import { isEnabled } from '@automattic/calypso-config';
import { isDashboardBackport } from '../utils/is-dashboard-backport';
import { hasHostingFeature, hasPlanFeature } from '../utils/site-features';
import { isSiteMigrationInProgress } from '../utils/site-status';
import { isSelfHostedJetpackConnected, isP2 } from '../utils/site-types';
import type { Site, User, WordPressPrerelease } from '@automattic/api-core';

export function canManageSite( site: Site ) {
	// Edge case: slug can be missing when the current user does not have
	// permission to manage the site.
	if ( ! site.slug ) {
		return false;
	}

	if ( site.is_deleted || ! site.capabilities?.manage_options ) {
		return false;
	}

	// Unsupported site types
	if ( isP2( site ) || site.is_vip ) {
		return false;
	}

	// Self-hosted Jetpack-connected sites are not supported in the dashboard backport.
	if ( isSelfHostedJetpackConnected( site ) ) {
		return ! isDashboardBackport();
	}

	return true;
}

// Settings -> General

export function canViewHundredYearPlanSettings( site: Site ) {
	return (
		hasPlanFeature( site, DotcomFeatures.LEGACY_CONTACT ) ||
		hasPlanFeature( site, DotcomFeatures.LOCKED_MODE )
	);
}

// Settings -> Server

/**
 * Sites without self-serve backups can also switch during the cycle they were
 * picked for early access to a WordPress release, so they can go back to the
 * stable one.
 */
export function canSwitchWordPressVersion(
	site: Site,
	prerelease?: Pick< WordPressPrerelease, 'enrolled_this_cycle' >
) {
	if ( isEnabled( 'dashboard/wp-beta-program' ) ) {
		// Atomic-only API.
		return (
			site.is_wpcom_atomic &&
			( hasHostingFeature( site, HostingFeatures.BACKUPS_SELF_SERVE ) ||
				!! prerelease?.enrolled_this_cycle )
		);
	}
	return site.is_wpcom_staging_site;
}

// Settings -> Actions & danger zone

export function canViewSiteActions( site: Site ) {
	return ! site.is_wpcom_staging_site;
}

export function canTransferSite( site: Site, user: User ) {
	const isSiteOwner = site.site_owner === user.ID;
	return ! site.is_wpcom_staging_site && isSiteOwner && ! isSelfHostedJetpackConnected( site );
}

// Mirrors the eligibility checks the Copy Site stepper flow enforces in
// `useSiteCopy` (client/landing/stepper/hooks/use-site-copy.tsx). Keep these in
// sync: if the menu shows "Duplicate" but any of these are false, the flow
// silently redirects back to the sites list with no error (DOTDEV-421).
export function canDuplicateSite( site: Site, user: User ) {
	const isSiteOwner = site.site_owner === user.ID;

	return (
		hasPlanFeature( site, DotcomFeatures.COPY_SITE ) &&
		isSiteOwner &&
		!! site.plan &&
		site.is_wpcom_atomic
	);
}

export function canLeaveSite( site: Site ) {
	return (
		! site.is_wpcom_staging_site &&
		! site.is_deleted &&
		! isP2( site ) &&
		! isSelfHostedJetpackConnected( site )
	);
}

export function canDisconnectSite( site: Site ) {
	return !! site.capabilities?.manage_options && isSelfHostedJetpackConnected( site );
}

export function canRestoreSite( site: Site ) {
	return site.is_deleted && ! isP2( site ) && ! isSelfHostedJetpackConnected( site );
}

export function canSwitchEnvironment( site: Site ) {
	if ( isSiteMigrationInProgress( site ) || site.is_a4a_dev_site ) {
		return false;
	}

	return hasHostingFeature( site, HostingFeatures.STAGING_SITE );
}

export function canCreateStagingSite( site: Site ) {
	if ( isSiteMigrationInProgress( site ) || site.is_a4a_dev_site ) {
		return false;
	}

	return (
		hasHostingFeature( site, HostingFeatures.STAGING_SITE ) &&
		! site.is_wpcom_staging_site &&
		! site?.options?.wpcom_staging_blog_ids?.length
	);
}
