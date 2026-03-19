import { ProductUpgradeMap, AkismetUpgradesProductMap } from '@automattic/api-core';
import { addQueryArgs } from '@wordpress/url';
import { getCurrentDashboard } from '../app/routing';
import { isSitePlanTrial, isSitePlanWooHosted } from '../sites/plans';
import { isDashboardBackport } from './is-dashboard-backport';
import { redirectToDashboardLink, wpcomLink } from './link';
import { isAkismetProduct, isJetpackT1SecurityPlan } from './purchase';
import { isSelfHostedJetpackConnected } from './site-types';
import type { Purchase, Site } from '@automattic/api-core';

/**
 * Returns a user-friendly version of the site's URL.
 *
 * This not only produces a clean version of the site's domain, but
 * also deals with the case of Jetpack multi-sites using subdirectory
 * installations.
 */
export function getSiteDisplayUrl( site: Site ) {
	return site.URL.replace( 'https://', '' ).replace( 'http://', '' );
}

/**
 * Returns the URL for editing the site.
 */
export function getSiteEditUrl( site: Site, isSiteUsingBlockTheme?: boolean ) {
	const location = typeof window !== 'undefined' ? window.location : null;
	const queryArgs: Record< string, string > = {};
	const siteAdminUrl = site.options?.admin_url;

	if ( isSiteUsingBlockTheme ) {
		if ( location && location.origin !== 'https://wordpress.com' ) {
			queryArgs.calypso_origin = location.origin;
		}

		return addQueryArgs( `${ siteAdminUrl }site-editor.php`, queryArgs );
	}

	if ( location ) {
		queryArgs.return = location.href;
	}

	return addQueryArgs( `${ siteAdminUrl }customize.php`, queryArgs );
}

/**
 * Returns the URL for the site visibility settings page.
 */
export function getSiteVisibilityURL( site: Site, queryArgs?: { back_to: 'site-overview' } ) {
	if ( isSelfHostedJetpackConnected( site ) ) {
		return undefined;
	}

	return addQueryArgs( `/sites/${ site.slug }/settings/site-visibility`, queryArgs );
}

/**
 * Given a site and its current plan's purchase (if any), this function does the following:
 *
 * - If the site is a wpcom site without a purchase, returns the URL to upgrade the site plan.
 * - Otherwise, returns the most appropriate URL to manage the site's current plan.
 */
export function getSitePlanUrl( site: Site, purchase?: Purchase ) {
	if ( site.is_wpcom_staging_site ) {
		return undefined;
	}

	if ( isSelfHostedJetpackConnected( site ) ) {
		return `https://cloud.jetpack.com/purchases/subscriptions/${ site.slug }`;
	}

	if ( site.is_a4a_dev_site ) {
		return `https://agencies.automattic.com/sites/overview/${ site.slug }`;
	}

	if ( ! purchase ) {
		return getSitePlanUpgradeUrl( site );
	}

	return isDashboardBackport()
		? wpcomLink( `/purchases/subscriptions/${ site.slug }/${ purchase.ID }` )
		: `/me/billing/purchases/${ purchase.ID }`;
}

export function getSitePlanUpgradeUrl( site: Site ) {
	return buildSitePlanUpgradeUrl( {
		siteSlug: site.slug,
		isTrial: isSitePlanTrial( site ),
		isWooHosted: isSitePlanWooHosted( site ),
	} );
}

export function getSitePurchaseUpgradeUrl( purchase: Purchase ) {
	if ( isAkismetProduct( purchase ) ) {
		// For the first Iteration of Calypso Akismet checkout we are only suggesting
		// for immediate upgrades to the next plan. We will change this in the future
		// with appropriate page.
		const url = AkismetUpgradesProductMap[ purchase.product_slug ];
		if ( ! url ) {
			return undefined;
		}
		const isAbsolute =
			url.startsWith( 'http://' ) || url.startsWith( 'https://' ) || url.startsWith( '//' );
		if ( ! isAbsolute ) {
			return wpcomLink( url );
		}
		return url;
	}

	const upgradeProductSlug = ProductUpgradeMap[ purchase.product_slug ];
	if ( upgradeProductSlug ) {
		const backUrl = redirectToDashboardLink();
		return addQueryArgs( wpcomLink( `/checkout/${ purchase.site_slug }/${ upgradeProductSlug }` ), {
			redirect_to: backUrl,
			cancel_to: backUrl,
		} );
	}

	if ( purchase.is_jetpack_backup_t1 || isJetpackT1SecurityPlan( purchase ) ) {
		return wpcomLink( `/plans/storage/${ purchase.site_slug }` );
	}

	if ( purchase.is_jetpack_plan_or_product ) {
		return wpcomLink( `/plans/${ purchase.site_slug }` );
	}

	return buildSitePlanUpgradeUrl( {
		siteSlug: purchase.site_slug,
		isTrial: purchase.is_trial_plan,
		isWooHosted: purchase.is_woo_hosted_product,
	} );
}

function buildSitePlanUpgradeUrl( {
	siteSlug,
	isTrial,
	isWooHosted,
}: {
	siteSlug: string;
	isTrial: boolean;
	isWooHosted: boolean;
} ) {
	if ( isTrial && ! isWooHosted ) {
		return wpcomLink( `/plans/${ siteSlug }` );
	}

	const backUrl = redirectToDashboardLink();
	const link = isWooHosted
		? wpcomLink( '/setup/woo-hosted-plans' )
		: wpcomLink( '/setup/plan-upgrade' );

	return addQueryArgs( link, {
		siteSlug: siteSlug,
		cancel_to: backUrl,
		dashboard: getCurrentDashboard(),
	} );
}
