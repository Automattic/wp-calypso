import { Page } from 'playwright';

export type DashboardTabs = 'At a Glance' | 'My Plan';
export type SettingsTabs =
	| 'Security'
	| 'Performance'
	| 'Writing'
	| 'Sharing'
	| 'Discussion'
	| 'Traffic'
	| 'Newsletter'
	| 'Monetize';
// Discriminated union type.
type JetpackTabs =
	| { view: 'Dashboard'; tab: DashboardTabs }
	| { view: 'Settings'; tab: SettingsTabs };

/**
 * Represents the Jetpack pages in WP-Admin.
 */
export class JetpackDashboardPage {
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
	 * Navigates to the Jetpack dashboard landing page for a site.
	 *
	 * Note that this method will not work for non-AT sites.
	 *
	 * @param {string} siteSlug Site slug.
	 */
	async visit( siteSlug: string ) {
		await this.page.goto( `https://${ siteSlug }/wp-admin/admin.php?page=jetpack#/dashboard`, {
			timeout: 15 * 1000,
		} );
	}

	/**
	 * Given a discriminated union type parameter `param`, first clicks on the specified view,
	 * then clicks on the specified tab.
	 *
	 * @param {JetpackTabs} param View and tab to click on.
	 */
	async clickTab( param: JetpackTabs ) {
		// Switch to the correct view if required.
		await this.page
			.getByRole( 'main' )
			.getByRole( 'link', { name: param.view, exact: true } )
			.click();
		await this.page.waitForURL( new RegExp( `page=jetpack#/${ param.view }`, 'i' ) );

		// Click on the tab.
		await this.page
			.getByRole( 'main' )
			.getByRole( 'menuitem', { name: param.tab, exact: true } )
			.click();
	}
}
