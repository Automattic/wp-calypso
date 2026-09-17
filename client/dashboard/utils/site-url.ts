import {
	ProductUpgradeMap,
	AkismetUpgradesProductMap,
	SubscriptionBillPeriod,
} from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import { getCurrentDashboard } from '../app/routing';
import { isSitePlanTrial, isSitePlanWooHosted } from '../sites/plans';
import { isDashboardBackport } from './is-dashboard-backport';
import { dashboardLink, redirectToDashboardLink, wpcomLink } from './link';
import {
	isAkismetProduct,
	isDotcomPlan,
	isPurchaseDowngradeEligible,
	isStorageUpgradeEligible,
	isTitanMail,
} from './purchase';
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
export function getSiteVisibilityURL( site: Site ) {
	if ( isSelfHostedJetpackConnected( site ) ) {
		return undefined;
	}

	return `/sites/${ site.slug }/settings/site-visibility`;
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
		redirectTo: redirectToDashboardLink(),
		cancelTo: redirectToDashboardLink(),
	} );
}

/**
 * The Dashboard purchase-settings page for a newly-provisioned purchase. The
 * `:purchaseId` placeholder is substituted by the checkout pending page once the
 * new subscription appears in the user's purchases (or it falls back to the site
 * overview after a timeout — see `pending-page.ts`).
 */
export function getPurchaseSettingsRedirectBase(): string {
	return dashboardLink( '/me/billing/purchases/:purchaseId' );
}

/**
 * Tags a post-checkout `redirect_to` with the success notice the destination
 * should show on arrival.
 */
function withPurchaseNotice( url: string, notice: 'upgraded' | 'plan_changed' ): string {
	return addQueryArgs( url, { [ notice ]: 'true' } );
}

/**
 * `redirect_to` for flows that can only ever upgrade, so the notice is known up
 * front. Plan changes tag their own inside {@link getWpcomPlanChangeUrl}, where
 * it depends on the purchase.
 */
export function getUpgradedPurchaseRedirectUrl(): string {
	return withPurchaseNotice( getPurchaseSettingsRedirectBase(), 'upgraded' );
}

export function getSitePurchaseUpgradeUrl( purchase: Purchase, redirectTo?: string ) {
	// Titan plans upgrade through the email tier grid, not the generic checkout.
	if ( config.isEnabled( 'emails/titan-tiers' ) && isTitanMail( purchase ) && purchase.meta ) {
		return dashboardLink( `/emails/choose-email-solution/${ purchase.meta }?intent=upgrade` );
	}

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

	if ( purchase.is_jetpack_plan_or_product ) {
		return wpcomLink( `/plans/${ purchase.site_slug }` );
	}

	return buildSitePlanUpgradeUrl( {
		siteSlug: purchase.site_slug,
		isTrial: purchase.is_trial_plan,
		isWooHosted: purchase.is_woo_hosted_product,
		redirectTo: redirectTo ?? redirectToDashboardLink(),
		cancelTo: redirectToDashboardLink(),
	} );
}

export function getSitePurchaseStorageUpgradeUrl( purchase: Purchase ): string | undefined {
	if ( ! isStorageUpgradeEligible( purchase ) ) {
		return undefined;
	}
	return wpcomLink( `/plans/storage/${ purchase.site_slug }` );
}

// Map the purchase's billing term to the plans grid's `intervalType` param so the
// grid opens on the same term as the current plan.
function getPlanGridIntervalType( purchase: Purchase ): string | undefined {
	switch ( purchase.bill_period_days ) {
		case SubscriptionBillPeriod.PLAN_MONTHLY_PERIOD:
			return 'monthly';
		case SubscriptionBillPeriod.PLAN_ANNUAL_PERIOD:
			return 'yearly';
		case SubscriptionBillPeriod.PLAN_BIENNIAL_PERIOD:
			return '2yearly';
		case SubscriptionBillPeriod.PLAN_TRIENNIAL_PERIOD:
			return '3yearly';
		default:
			return undefined;
	}
}

export interface WpcomPlanChangeTarget {
	href: string;
	/**
	 * Allows callers to determine if the target points to a page that offers
	 * downgrade options.
	 */
	offersDowngrades: boolean;
}

export interface WpcomPlanChangeInput {
	cancelTo: string;
	/**
	 * Base URL without a success-notice param; one is automatically appended
	 * based on the destination.
	 */
	redirectTo: string;
	/**
	 * Forces the target to be a page without downgrade options; useful for
	 * callers that want to deliberately promote upgrades.
	 */
	upgradeOnly?: boolean;
}

/**
 * Where to send someone who wants to move a WordPress.com plan to a different
 * one, and whether that destination offers downgrades. Returns `undefined` when
 * there is nowhere to send them — either this is not a WordPress.com plan (those
 * keep their own destinations via {@link getSitePurchaseUpgradeUrl}), or the plan
 * can be neither upgraded nor downgraded.
 *
 * Downgrade eligibility is decided here rather than by the caller, so
 * `upgradeOnly` can only suppress downgrades, never request them. That eligibility
 * comes back as `offersDowngrades`, so labels derived from it cannot disagree with
 * where the link actually goes.
 *
 * Callers are responsible for checking that the user has permission to change the
 * plan; this only reports what the purchase itself allows.
 */
export function getWpcomPlanChangeTarget(
	purchase: Purchase,
	{ cancelTo, redirectTo, upgradeOnly = false }: WpcomPlanChangeInput
): WpcomPlanChangeTarget | undefined {
	if ( ! isDotcomPlan( purchase ) ) {
		return undefined;
	}

	const offersDowngrades = ! upgradeOnly && isPurchaseDowngradeEligible( purchase );

	if ( ! purchase.is_upgradable && ! offersDowngrades ) {
		return undefined;
	}

	const taggedRedirectTo = withPurchaseNotice(
		redirectTo,
		offersDowngrades ? 'plan_changed' : 'upgraded'
	);

	if ( offersDowngrades ) {
		const intervalType = getPlanGridIntervalType( purchase );
		return {
			href: addQueryArgs( wpcomLink( '/setup/plan-upgrade' ), {
				...( purchase.site_slug && { siteSlug: purchase.site_slug } ),
				...( intervalType && { intervalType } ),
				cancel_to: cancelTo,
				dashboard: getCurrentDashboard(),
				redirect_to: taggedRedirectTo,
				allow_downgrade: 'true',
			} ),
			offersDowngrades,
		};
	}

	return {
		href: buildSitePlanUpgradeUrl( {
			siteSlug: purchase.site_slug,
			isTrial: purchase.is_trial_plan,
			isWooHosted: purchase.is_woo_hosted_product,
			redirectTo: taggedRedirectTo,
			cancelTo,
		} ),
		offersDowngrades,
	};
}

/**
 * {@link getWpcomPlanChangeTarget} for callers that only need somewhere to link
 * to. A URL comes back only when the purchase allows a plan change; callers are
 * still responsible for checking that the user has permission to make it.
 */
export function getWpcomPlanChangeUrl(
	purchase: Purchase,
	input: WpcomPlanChangeInput
): string | undefined {
	return getWpcomPlanChangeTarget( purchase, input )?.href;
}

/**
 * Where a plan change started from the Dashboard ends up: abandoning it returns
 * the user to where they were, and completing it lands them on the new purchase.
 * Shared by everything that offers a plan change, so they can't send people to
 * different places.
 *
 * Not the plan-change URL itself — that comes back from
 * {@link getWpcomPlanChangeTarget}, which these are an input to.
 */
export function getPlanChangeReturnUrls(): {
	cancelTo: string;
	redirectTo: string;
} {
	return {
		cancelTo: redirectToDashboardLink(),
		redirectTo: getPurchaseSettingsRedirectBase(),
	};
}

function buildSitePlanUpgradeUrl( {
	siteSlug,
	isTrial,
	isWooHosted,
	redirectTo,
	cancelTo,
}: {
	siteSlug: string;
	isTrial: boolean;
	isWooHosted: boolean;
	redirectTo: string;
	cancelTo: string;
} ) {
	if ( isTrial && ! isWooHosted ) {
		return wpcomLink( `/plans/${ siteSlug }` );
	}

	const link = isWooHosted
		? wpcomLink( '/setup/woo-hosted-plans' )
		: wpcomLink( '/setup/plan-upgrade' );

	return addQueryArgs( link, {
		siteSlug: siteSlug,
		cancel_to: cancelTo,
		dashboard: getCurrentDashboard(),
		redirect_to: redirectTo,
	} );
}
