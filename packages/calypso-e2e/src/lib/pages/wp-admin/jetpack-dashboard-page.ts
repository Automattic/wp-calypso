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
		// Switch to the correct view (Dashboard/Settings) if required.
		await this.page
			.getByRole( 'main' )
			.getByRole( 'link', { name: param.view, exact: true } )
			.click();
		await this.page.waitForURL( new RegExp( `page=jetpack#/${ param.view }`, 'i' ) );

		if ( param.view === 'Settings' ) {
			// Settings tabs use @wordpress/ui.
			const nav = this.page
				.getByRole( 'main' )
				.getByRole( 'tablist', { name: 'Jetpack settings sections' } );

			await nav.getByRole( 'tab', { name: param.tab, exact: true } ).click();

			// Verify the clicked tab is now active.
			await nav
				.getByRole( 'tab', { name: param.tab, exact: true } )
				.and( this.page.locator( '[aria-selected="true"]' ) )
				.waitFor();
		} else {
			// Dashboard tabs use NavItem components (role="menuitem" + .is-selected).
			await this.page
				.getByRole( 'main' )
				.getByRole( 'menuitem', { name: param.tab, exact: true } )
				.click();

			await this.page
				.getByRole( 'main' )
				.filter( { has: this.page.locator( '.is-selected' ) } )
				.filter( { hasText: param.tab } )
				.waitFor();
		}
	}
}
