import { DotcomPlans, JetpackFeatures } from '@automattic/api-core';
import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import {
	chartBar,
	cloud,
	megaphone,
	next,
	removeBug,
	search,
	shield,
	video,
} from '@wordpress/icons';
import { purchaseSettingsRoute, purchasesRoute } from '../app/router/me';
import { hasPlanFeature } from '../utils/site-features';
import { isDashboardBackport } from './is-dashboard-backport';
import { wpcomLink } from './link';
import { isCommerceGarden, isSelfHostedJetpackConnected } from './site-types';
import type {
	JetpackFeatureSlug,
	Purchase,
	Site,
	DashboardSiteListSite,
} from '@automattic/api-core';

export const JETPACK_PRODUCTS = [
	{
		id: JetpackFeatures.STATS,
		icon: chartBar,
		label: __( 'Jetpack Stats' ),
		description: __( 'Clear, concise, and actionable analysis of your site performance.' ),
	},
	{
		id: JetpackFeatures.BACKUPS,
		icon: cloud,
		label: __( 'Jetpack VaultPress Backup' ),
		description: __(
			'Real-time backups save every change, and one-click restores get you back online quickly.'
		),
	},
	{
		id: JetpackFeatures.SOCIAL_ENHANCED_PUBLISHING,
		icon: megaphone,
		label: __( 'Jetpack Social' ),
		description: __(
			'Auto‑share your posts to social networks and track engagement in one place.'
		),
	},
	{
		id: JetpackFeatures.CLOUD_CRITICAL_CSS,
		icon: next,
		label: __( 'Jetpack Boost' ),
		description: __( 'Improves your site speed and performance.' ),
	},
	{
		id: JetpackFeatures.ANTISPAM,
		icon: removeBug,
		label: __( 'Akismet Anti-spam' ),
		description: __( 'Automatically clear spam from comments and forms.' ),
	},
	{
		id: JetpackFeatures.SEARCH,
		icon: search,
		label: __( 'Jetpack Search' ),
		description: __( 'Instantly deliver the most relevant results to your visitors.' ),
	},
	{
		id: JetpackFeatures.SCAN,
		icon: shield,
		label: __( 'Jetpack Scan' ),
		description: __( 'Guard against malware and bad actors 24/7.' ),
	},
	{
		id: JetpackFeatures.VIDEOPRESS,
		icon: video,
		label: __( 'Jetpack VideoPress' ),
		description: __( 'Powerful and flexible video hosting.' ),
	},
];

export function getJetpackProductsForSite( site: Pick< Site, 'plan' > ) {
	return JETPACK_PRODUCTS.filter( ( product ) =>
		hasPlanFeature( site, product.id as JetpackFeatureSlug )
	);
}

export function getSitePlanDisplayName( site: Site ) {
	if ( site.is_wpcom_staging_site ) {
		return __( 'Staging Site' );
	}

	const plan = site.plan;
	if ( ! plan ) {
		return '';
	}

	if ( plan.product_slug === DotcomPlans.JETPACK_FREE ) {
		const products = getJetpackProductsForSite( site );
		if ( products.length === 1 ) {
			return products[ 0 ].label;
		}
		if ( products.length > 1 ) {
			return __( 'Jetpack' );
		}
	}

	// Display the short name for WP.com plans.
	// Determine if the plan is a WP.com plan by checking if the license key is empty.
	if ( ! plan.license_key ) {
		return plan.product_name_short;
	}

	return plan.product_name || plan.product_name_short;
}

export function getSitePlanDisplayName__ES( site: DashboardSiteListSite ) {
	const plan = site.plan;
	if ( ! plan ) {
		return '';
	}

	if ( plan.product_slug === DotcomPlans.JETPACK_FREE ) {
		const products = getJetpackProductsForSite( site );
		if ( products.length === 1 ) {
			return products[ 0 ].label;
		}
		if ( products.length > 1 ) {
			return __( 'Jetpack' );
		}
	}

	return plan.product_name_short;
}

export function useSitePlanManageURL( site: Site, purchase?: Purchase ) {
	const router = useRouter();
	const host = typeof window !== 'undefined' ? window.location.host : 'wordpress.com';
	const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';

	if ( site.is_wpcom_staging_site ) {
		return undefined;
	}

	if ( isSelfHostedJetpackConnected( site ) ) {
		return `https://cloud.jetpack.com/purchases/subscriptions/${ site.slug }`;
	}

	if ( site.is_a4a_dev_site ) {
		return `https://agencies.automattic.com/sites/overview/${ site.slug }`;
	}

	if ( site.plan?.is_free ) {
		return isCommerceGarden( site )
			? wpcomLink( `/setup/woo-hosted-plans?siteSlug=${ site.slug }` )
			: wpcomLink( `/setup/plan-upgrade?siteSlug=${ site.slug }` );
	}

	if ( isDashboardBackport() ) {
		return `${ protocol }//${ host }/purchases/subscriptions/${ site.slug }/${ purchase?.ID }`;
	}

	// Use the purchase settings page if the purchase is provided.
	if ( purchase ) {
		return router.buildLocation( {
			to: purchaseSettingsRoute.fullPath,
			params: { purchaseId: purchase.ID },
		} ).href;
	}

	// Default to the account purchases page.
	return purchasesRoute.fullPath;
}
