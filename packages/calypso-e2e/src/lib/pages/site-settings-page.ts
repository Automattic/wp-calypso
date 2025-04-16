import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

/**
 * Represents the Sites > Site > Settings page.
 */
export class SiteSettingsPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Visits the `/sites/settings/$tab` endpoint.
	 *
	 * @param {string} siteSlug Site URL.
	 * @param {string} tab      Settings tab.
	 */
	async visit( siteSlug: string, tab: string = 'site' ): Promise< void > {
		await this.page.goto( getCalypsoURL( `sites/settings/${ tab }/${ siteSlug }` ), {
			timeout: 20 * 1000,
		} );
	}

	/**
	 * Start the site launch process.
	 */
	async launchSite(): Promise< void > {
		const launchSite = this.page.getByRole( 'button', { name: 'Launch site' } ).first();
		await launchSite.click();
	}

	/**
	 * Given text, clicks on a button with matching text.
	 *
	 * @param {string} text Text to search on the button.
	 */
	async clickButton( text: string ) {
		await this.page.getByRole( 'button', { name: text } ).click();
	}
}
