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

export function convertPlatformName( platform: string ): string {
	return platformMap[ platform ] !== undefined ? platformMap[ platform ] : 'Unknown';
}

export function getWpComImporterUrl( siteSlug: string, importer: string ): string {
	const wpComBase = 'https://wordpress.com/import/{siteSlug}?engine={importer}';

	return wpComBase.replace( '{siteSlug}', siteSlug ).replace( '{importer}', importer );
}

export function getWpAdminImporterUrl( siteSlug: string, importer: string ): string {
	const wpAdminBase = 'https://{siteSlug}/wp-admin/admin.php?import={importer}';

	return wpAdminBase.replace( '{siteSlug}', siteSlug ).replace( '{importer}', importer );
}
