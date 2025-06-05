import { Page } from 'playwright';
import { envVariables } from '../..';
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
	 * Navigates to a given item in the sidebar.
	 *
	 * @param {string} item Item to navigate to.
	 */
	async navigateToSubmenu( item: string ) {
		if ( envVariables.VIEWPORT_NAME === 'mobile' ) {
			await this.page.getByRole( 'button', { name: 'General' } ).click();
		}

		await this.page.getByRole( 'link', { name: item } ).click();
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
