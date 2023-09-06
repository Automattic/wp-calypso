import { Locator, Page } from 'playwright';

/**
 * Represents the Subscription Management page, accessed under
 * /subscriptions/sites when confirming subscription to a site.
 */
export class SubscriptionManagementPage {
	private page: Page;
	private anchor: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page
	 */
	constructor( page: Page ) {
		this.page = page;
		this.anchor = this.page.getByRole( 'main' );
	}

	/**
	 * Validates the user is subscribed to a specific site, either by
	 * the site name or the site URL.
	 *
	 * @param param0 Keyed object parameter.
	 * @param {string} [param0.siteName] Name of the site.
	 * @param {string} [param0.siteURL] URL of the site.
	 * @throws {Error} If no params are defined.
	 */
	async validateSubscribedSiteBy( {
		siteName,
		siteURL,
	}: { siteName?: string; siteURL?: string } = {} ) {
		if ( ! siteName && ! siteURL ) {
			throw new Error( 'Must define either of `siteName` or `siteURL`.' );
		}
		// Yes, this OR statement actually works!
		await this.anchor.getByRole( 'link', { name: siteName || siteURL } ).waitFor();
	}
}
