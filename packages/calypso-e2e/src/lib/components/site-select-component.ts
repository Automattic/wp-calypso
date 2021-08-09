import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	searchInput: '[aria-label="Search"]',
	siteList: '.site-selector__sites',
};

/**
 * Represents the Site Select component.
 */
export class SiteSelectComponent {
	private page: Page;

	/**
	 * Creates an instance of the Site Select component.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Check if the Site Selector page is shown.
	 *
	 * @returns {Promise<boolean>} Whether the site selector is shown.
	 */
	async isSiteSelectorVisible(): Promise< boolean > {
		await this.page.waitForLoadState( 'load' );
		return await this.page.isVisible( ':has-text("Select a site")' );
	}

	/**
	 * Navigate to the site selector endpoint.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async showSiteSelector(): Promise< void > {
		// Wait for any preceding page load to finish first.
		await this.page.waitForLoadState( 'load' );
		// Obtain and navigate to the raw /home endpoint, which de-selects the
		// currently selected site.
		const homeURL = getCalypsoURL( 'home' );
		await this.page.goto( homeURL );
		await this.page.waitForLoadState( 'load' );
	}

	/**
	 * Given a site URL, search for and select the matching site.
	 *
	 * This method will enter the desired site URL to the input field, wait for the matching
	 * result to load, then click on the entry.
	 *
	 * @param {string} url URL of the desired site. Must not include the protocol (https).
	 * @returns {Promise<void>} No return value.
	 */
	async selectSite( url: string ): Promise< void > {
		await this.page.fill( selectors.searchInput, url );
		// For some accounts with many sites, the search process takes a looooong time.
		await this.page.waitForSelector( '.is-loading', { state: 'hidden', timeout: 60 * 1000 } );

		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( `${ selectors.siteList } :text("${ url }")`, { timeout: 60 * 1000 } ),
		] );

		// Assert the resulting URL is in the form of <protocol><calypsoBaseURL>/home/<url>.
		await this.page.waitForURL( `**/home/${ url }` );
	}
}
