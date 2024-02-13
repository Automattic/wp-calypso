import {
	PLAN_MIGRATION_TRIAL_MONTHLY,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_HOSTING_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { Falsy } from 'utility-types';
import type { SiteNetworkData } from './use-sites';

export function isCustomDomain( siteSlug: string | null | undefined ): boolean {
	if ( ! siteSlug ) {
		return false;
	}
	return ! siteSlug.endsWith( '.wordpress.com' ) && ! siteSlug.endsWith( '.wpcomstaging.com' );
}

export const isMigrationTrialSite = ( site: SiteNetworkData ) => {
	return site?.plan?.product_slug === PLAN_MIGRATION_TRIAL_MONTHLY;
};

export const isHostingTrialSite = ( site: SiteNetworkData ) => {
	return site?.plan?.product_slug === PLAN_HOSTING_TRIAL_MONTHLY;
};

export const isECommerceTrialSite = ( site: SiteNetworkData ) => {
	return site?.plan?.product_slug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
};

export const isBusinessTrialSite = ( site: SiteNetworkData ) => {
	return isMigrationTrialSite( site ) || isHostingTrialSite( site );
};

export const isTrialSite = ( site: SiteNetworkData ) => {
	return isBusinessTrialSite( site ) || isECommerceTrialSite( site );
};

/**
 * Returns the WordPress.com URL of a site (simple or Atomic)
 * @param {Object} site Site object
 * @returns {?string} WordPress.com URL
 */
// @ts-expect-error TODO
export function getUnmappedUrl( site ) {
	if ( ! site || ! site.options ) {
		return null;
	}

	return site.options.main_network_site || site.options.unmapped_url;
}

/**
 * Returns a filtered array of WordPress.com site IDs where a Jetpack site
 * exists in the set of sites with the same URL.
 * @param {Array} siteList Array of site objects
 * @returns {number[]} Array of site IDs with URL collisions
 */
// @ts-expect-error TODO
export function getJetpackSiteCollisions( siteList ) {
	// @ts-expect-error TODO
	const jetpackSites = siteList.filter( ( siteItem ) => {
		const siteUrlSansProtocol = withoutHttp( siteItem.URL );
		return (
			! siteItem.jetpack &&
			siteList.some(
				// @ts-expect-error TODO
				( jetpackSite ) =>
					jetpackSite.jetpack && siteUrlSansProtocol === withoutHttp( jetpackSite.URL )
			)
		);
	} );
	// @ts-expect-error TODO
	return jetpackSites.map( ( siteItem ) => siteItem.ID );
}

const urlWithoutHttpRegex = /^https?:\/\//;

/**
 * Returns the supplied URL without the initial http(s).
 * @param  url The URL to remove http(s) from
 * @returns     URL without the initial http(s)
 */
export function withoutHttp( url: '' ): '';
export function withoutHttp( url: Falsy ): null;
export function withoutHttp( url: string ): string;
export function withoutHttp( url: string | Falsy ): string | null {
	if ( url === '' ) {
		return '';
	}

	if ( ! url ) {
		return null;
	}

	return url.replace( urlWithoutHttpRegex, '' );
}

export function urlToSlug( url: Falsy ): null;
export function urlToSlug( url: string ): string;
export function urlToSlug( url: string | Falsy ): string | null {
	if ( ! url ) {
		return null;
	}

	return withoutHttp( url ).replace( /\//g, '::' );
}
