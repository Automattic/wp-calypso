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
	 * Given a site URL, search for and select the matching site.
	 *
	 * This method will forcibly navigate the page to the /home endpoint with no site forming
	 * part of the URL. The raw /home endpoint will present to the user a list of sites belonging
	 * to the said user.
	 *
	 * This method will then enter the desired site URL to the input field, wait for the matching
	 * result to load, then click on the entry.
	 *
	 * @param {string} url URL of the desired site. Must not include the protocol (https).
	 * @returns {Promise<void>} No return value.
	 */
	async selectSite( url: string ): Promise< void > {
		// Wait for any preceding page load to finish first.
		await this.page.waitForLoadState( 'load' );
		const homeURL = getCalypsoURL( 'home' );
		await this.page.goto( homeURL );
		// Navigate to the raw /home endpoint to trigger site selection.
		await this.page.waitForLoadState( 'load' );

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
