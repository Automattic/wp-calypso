/**
 * Build the WooPayments connect URL on a site's WP-Admin, where the agency finishes setup.
 */
export function getSiteSetupUrl( siteUrl: string ): string {
	return `${ siteUrl }/wp-admin/admin.php?page=wc-admin&path=/payments/connect`;
}
