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
	 * Visits the `/sites/settings/site` endpoint.
	 *
	 * @param {string} siteSlug Site URL.
	 */
	async visit( siteSlug: string ): Promise< void > {
		await this.page.goto( getCalypsoURL( `sites/settings/site/${ siteSlug }` ), {
			timeout: 20 * 1000,
		} );
	}

	/**
	 * Start the site launch process.
	 */
	async launchSite(): Promise< void > {
		const launchSite = this.page.getByRole( 'link', { name: 'Launch site' } );
		await launchSite.click();
	}
}
