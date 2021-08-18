import { Page } from 'playwright';

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
	 * The site selector can be shown on either one of the following:
	 * 	- in a pseudo-sidebar, replacing the navigation sidebar.
	 * 	- as a standalone component on the main content portion of the page.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Check if the Site Selector component is shown.
	 *
	 * @returns {Promise<boolean>} Whether the site selector is shown.
	 */
	async isSiteSelectorVisible(): Promise< boolean > {
		await this.page.waitForLoadState( 'load' );
		return await this.page.isVisible( ':has-text("Select a site")' );
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

	/**
	 * Clicks on the Add Site button at bottom of the site selector within the sidebar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async addSite(): Promise< void > {
		await Promise.all( [
			this.page.waitForNavigation(),
			this.page.click( 'a:text("Add New Site")' ),
		] );
	}
}
