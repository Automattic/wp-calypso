const platformMap: { [ key: string ]: string } = {
	wordpress: 'WordPress',
	wix: 'Wix',
	blogger: 'Blogger',
	medium: 'Medium',
	'godaddy-central': 'GoDaddy Central',
	tumblr: 'Tumblr',
	squarespace: 'Squarespace',
	blogroll: 'Blogroll',
	ghost: 'Ghost',
	livejournal: 'LiveJournal',
	movabletype: 'Movable Type & TypePad',
	xanga: 'Xanga',
};

export const platformImporterNameMap: { [ key: string ]: string } = {
	xanga: 'xanga-wxr',
	ghost: 'ghost_import',
	blogroll: 'opml',
	movabletype: 'mt',
};

export const orgImporters: string[] = [
	'xanga',
	'tumblr',
	'movabletype',
	'livejournal',
	'ghost',
	'blogroll',
];

/**
 * Platform name helpers
 */
export function getPlatformImporterName( platform: string ): string {
	return platformImporterNameMap[ platform ] ? platformImporterNameMap[ platform ] : platform;
}

export function convertPlatformName( platform: string ): string {
	return platformMap[ platform ] !== undefined ? platformMap[ platform ] : 'Unknown';
}

export function convertToFriendlyWebsiteName( website: string ): string {
	const { hostname, pathname } = new URL( website );
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
	platform: string,
	fromSite?: string
): string {
	return '/start/from/importing/{importer}?from={fromSite}&to={siteSlug}'
		.replace( '{siteSlug}', siteSlug )
		.replace( '{importer}', getPlatformImporterName( platform ) )
		.replace( '{fromSite}', fromSite || '' );
}

export function getWpComImporterUrl(
	siteSlug: string,
	platform: string,
	fromSite?: string
): string {
	const wpComBase = '/import/{siteSlug}?engine={importer}&from-site={fromSite}';

	return wpComBase
		.replace( '{siteSlug}', siteSlug )
		.replace( '{importer}', getPlatformImporterName( platform ) )
		.replace( '{fromSite}', fromSite || '' );
}

export function getWpOrgImporterUrl( siteSlug: string, platform: string ): string {
	const wpAdminBase = 'https://{siteSlug}/wp-admin/admin.php?import={importer}';

	return wpAdminBase
		.replace( '{siteSlug}', siteSlug )
		.replace( '{importer}', getPlatformImporterName( platform ) );
}

export function getImporterUrl( siteSlug: string, platform: string, fromSite?: string ): string {
	if ( platform === 'wordpress' ) {
		return getWpComMigrateUrl( siteSlug, fromSite );
	} else if ( orgImporters.includes( platform ) ) {
		return getWpOrgImporterUrl( siteSlug, platform );
	}

	return getWpComImporterUrl( siteSlug, platform, fromSite );
}
