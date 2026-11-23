import { Page } from 'playwright';
import { completeJetpackSso } from './jetpack-sso';

// The tabs Jetpack keeps on Settings once My Jetpack takes over the rest; the server picks
// which of these a site shows.
export type SettingsTabs = 'Security' | 'Traffic' | 'Monetize';

/**
 * Represents the Jetpack Settings page in WP-Admin.
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
	 * Navigates to the Jetpack Settings page for a site.
	 *
	 * Note that this method will not work for non-AT sites.
	 *
	 * @param {string} siteSlug Site slug.
	 */
	async visit( siteSlug: string ) {
		await this.page.goto(
			`https://${ siteSlug }/wp-admin/admin.php?page=jetpack-settings#/settings`,
			{ timeout: 15 * 1000 }
		);
		await completeJetpackSso( this.page );
	}

	/**
	 * Clicks on the specified Settings tab and waits for it to become active.
	 *
	 * @param {SettingsTabs} tab Tab to click on.
	 */
	async clickTab( tab: SettingsTabs ) {
		// Settings tabs use @wordpress/ui.
		const nav = this.page.getByRole( 'tablist', { name: 'Jetpack settings sections' } );

		await nav.getByRole( 'tab', { name: tab, exact: true } ).click();

		// Verify the clicked tab is now active.
		await nav
			.getByRole( 'tab', { name: tab, exact: true } )
			.and( this.page.locator( '[aria-selected="true"]' ) )
			.waitFor();
	}

	/**
	 * Waits for My Jetpack › Features, where Settings sends a site that has no tab left on it.
	 */
	async waitForFeaturesInMyJetpack() {
		await this.page.waitForURL( /[?&]page=my-jetpack\b/ );
		await this.page.getByRole( 'tab', { name: 'Features', selected: true } ).waitFor();
	}
}
