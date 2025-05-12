import { capitalize } from 'lodash';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

export const CAPTURE_URL_RGX =
	/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,63}(:[0-9]{1,5})?(\/.*)?$/i;

/**
 * This regex is a bit more lenient than CAPTURE_URL_RGX, and is used for receiving any redirects like:
 * - http://www.example.com
 * - https://www.example.com
 * - http://localhost:9090
 * - http://somethingelse
 * - http://somecampaing#withhash?andquery
 */
export const CAPTURE_URL_RGX_SOFT =
	/^(https?:)?(?:[a-zA-Z0-9-.]+\.)?[a-zA-Z]{0,}(?:\/[^\s]*){0,}(:[0-9/a-z-#]*)?$/i;

const platformMap: { [ key in ImporterPlatform ]: string } = {
	wordpress: 'WordPress',
	wix: 'Wix',
	blogger: 'Blogger',
	medium: 'Medium',
	'godaddy-central': 'GoDaddy Central',
	tumblr: 'Tumblr',
	squarespace: 'Squarespace',
	ghost: 'Ghost',
	livejournal: 'LiveJournal',
	movabletype: 'Movable Type & TypePad',
	xanga: 'Xanga',
	substack: 'Substack',
	unknown: 'Unknown',
};

export const platformImporterNameMap: { [ key: string ]: string } = {
	xanga: 'xanga-wxr',
	ghost: 'ghost_import',
	movabletype: 'mt',
};

export const orgImporters: ImporterPlatform[] = [
	'xanga',
	'tumblr',
	'movabletype',
	'livejournal',
	'ghost',
];

/**
 * Platform name helpers
 */
export function getPlatformImporterName( platform: ImporterPlatform ): string {
	return platformImporterNameMap[ platform ] ? platformImporterNameMap[ platform ] : platform;
}

export function convertPlatformName( platform: ImporterPlatform ): string {
	return platformMap[ platform ] ?? 'Unknown';
}

export function convertToFriendlyWebsiteName( website: string ): string {
	const { hostname, pathname } = new URL(
		website.startsWith( 'http' ) ? website : `http://${ website }`
	);
	return ( hostname + ( pathname === '/' ? '' : pathname ) ).replace( 'www.', '' );
}

/**
 * Importer URL helpers
 */
export function getWpComMigrateUrl( siteSlug: string, fromSite?: string ): string {
	return '/migrate/{siteSlug}?from-site={fromSite}'
		.replace( '{siteSlug}', siteSlug )
		.replace( '{fromSite}', fromSite || '' );
}

export function getWpComOnboardingUrl(
	siteSlug: string,
	platform: ImporterPlatform,
	fromSite?: string
): string {
	const route = 'importer{importer}?siteSlug={siteSlug}&from={fromSite}';

	return route
		.replace( '{siteSlug}', siteSlug )
		.replace( '{importer}', capitalize( getPlatformImporterName( platform ) ) )
		.replace( '{fromSite}', fromSite || '' );
}

export function getWpComImporterUrl(
	siteSlug: string,
	platform: ImporterPlatform,
	fromSite?: string
): string {
	const wpComBase = '/import/{siteSlug}?engine={importer}&from-site={fromSite}';

	return wpComBase
		.replace( '{siteSlug}', siteSlug )
		.replace( '{importer}', getPlatformImporterName( platform ) )
		.replace( '{fromSite}', fromSite || '' );
}

export function getWpOrgImporterUrl( siteSlug: string, platform: ImporterPlatform ): string {
	const wpAdminBase = 'https://{siteSlug}/wp-admin/admin.php?import={importer}';

	return wpAdminBase
		.replace( '{siteSlug}', siteSlug )
		.replace( '{importer}', getPlatformImporterName( platform ) );
}

export function getImporterUrl(
	siteSlug: string,
	platform: ImporterPlatform,
	fromSite?: string
): string {
	if ( platform === 'wordpress' ) {
		return getWpComMigrateUrl( siteSlug, fromSite );
	} else if ( orgImporters.includes( platform ) ) {
		return getWpOrgImporterUrl( siteSlug, platform );
	}

	return getWpComImporterUrl( siteSlug, platform, fromSite );
}
