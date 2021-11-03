export function getWpComImporterUrl( siteSlug: string, importer: string ): string {
	const wpComBase = 'https://wordpress.com/import/{siteSlug}?engine={importer}';

	return wpComBase.replace( '{siteSlug}', siteSlug ).replace( '{importer}', importer );
}

export function getWpAdminImporterUrl( siteSlug: string, importer: string ): string {
	const wpAdminBase = 'https://{siteSlug}/wp-admin/admin.php?import={importer}';

	return wpAdminBase.replace( '{siteSlug}', siteSlug ).replace( '{importer}', importer );
}
