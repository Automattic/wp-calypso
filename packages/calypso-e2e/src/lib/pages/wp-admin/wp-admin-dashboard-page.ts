import { Page } from 'playwright';

/**
 * Represents the dashboard page in WP-Admin.
 */
export class WpAdminDashboardPage {
	private page: Page;

	/**
	 * Constructs an instance of the page.
	 *
	 * @param {Page} page Instance of the Page object.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Navigates to the WP-Admin dashboard landing page for a site.
	 *
	 * @param {string} siteSlug Site slug.
	 */
	async visit( siteSlug: string ) {
		await this.page.goto( `https://${ siteSlug }/wp-admin/`, {
			timeout: 15 * 1000,
		} );
	}
}
