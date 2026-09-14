export function getSiteSetupUrl( siteUrl: string ): string {
	return `${ siteUrl }/wp-admin/admin.php?page=wc-admin&path=/payments/connect`;
}
