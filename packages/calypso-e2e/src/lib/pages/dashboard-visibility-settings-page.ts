/**
 * External dependencies
 */
import { Page } from 'playwright';

/**
 * Dashboard visibility settings page class.
 *
 * This Page Object represents the site visibility settings page
 * accessible under the /settings/site-visibility path.
 */
export class DashboardVisibilitySettingsPage {
	/**
	 * Reference to the Playwright page object.
	 */
	private page: Page;

	/**
	 * Constructs a new DashboardVisibilitySettingsPage instance.
	 *
	 * @param page - The Playwright page object.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Sets the "Discourage search engines from indexing this site" option.
	 *
	 * @returns Promise that resolves when this option is set
	 */
	async setDiscourageSearchEngines(): Promise< void > {
		await this.page
			.getByRole( 'checkbox', { name: 'Discourage search engines from indexing this site' } )
			.click();
	}

	/**
	 * Sets the site visibility by selecting the appropriate radio button
	 *
	 * @param visibility - The desired site visibility.
	 * @returns Promise that resolves when the radio button is set.
	 */
	async setSiteVisibility( visibility: 'Public' | 'Private' | 'Coming soon' ): Promise< void > {
		await this.page.getByRole( 'radio', { name: visibility } ).click();
	}

	/**
	 * Saves changes on the settings page by clicking the Save button and waiting for the request to finish.
	 * @returns Promise that resolves to the text content of the dismissal notice, or null if no notice appears.
	 */
	async saveSiteVisibilityChanges(): Promise< string | null > {
		await this.page.getByRole( 'button', { name: 'Save' } ).click();
		return await this.page.getByRole( 'button', { name: 'Dismiss this notice' } ).textContent();
	}
}
