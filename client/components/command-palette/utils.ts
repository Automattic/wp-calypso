import {
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { SiteExcerptData, SiteExcerptNetworkData } from 'calypso/data/sites/site-excerpt-types';

export function isCustomDomain( siteSlug: string | null | undefined ): boolean {
	if ( ! siteSlug ) {
		return false;
	}
	return ! siteSlug.endsWith( '.wordpress.com' ) && ! siteSlug.endsWith( '.wpcomstaging.com' );
}

export const isNotAtomicJetpack = ( site: SiteExcerptNetworkData ) => {
	return site.jetpack && ! site?.is_wpcom_atomic;
};

export const isP2Site = ( site: SiteExcerptNetworkData ) => {
	return site.options?.is_wpforteams_site;
};

export const isMigrationTrialSite = ( site: SiteExcerptNetworkData ) => {
	return site?.plan?.product_slug === PLAN_MIGRATION_TRIAL_MONTHLY;
};

export const isHostingTrialSite = ( site: SiteExcerptNetworkData ) => {
	return site?.plan?.product_slug === PLAN_HOSTING_TRIAL_MONTHLY;
};

export const isECommerceTrialSite = ( site: SiteExcerptNetworkData ) => {
	return site?.plan?.product_slug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
};

export const isBusinessTrialSite = ( site: SiteExcerptNetworkData ) => {
	return isMigrationTrialSite( site ) || isHostingTrialSite( site );
};

export const isTrialSite = ( site: SiteExcerptNetworkData ) => {
	return isBusinessTrialSite( site ) || isECommerceTrialSite( site );
};

export const siteDefaultInterface = ( site: SiteExcerptNetworkData ) => {
	return site?.options?.wpcom_admin_interface;
};

export interface InterfaceURLFragment {
	calypso: `/${ string }`;
	wpAdmin: `/${ string }`;
}

export const generateSiteInterfaceLink = (
	site: SiteExcerptData,
	urlFragment: InterfaceURLFragment
) => {
	const isWpAdminDefault =
		( site.jetpack && ! site.is_wpcom_atomic ) || siteDefaultInterface( site ) === 'wp-admin';

	const targetLink = isWpAdminDefault
		? `${ site.URL }/wp-admin${ urlFragment.wpAdmin }`
		: `${ urlFragment.calypso }/${ site.slug }`;

	return targetLink;
};
