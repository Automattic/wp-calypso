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
	 * @param {string} identifier Identifier to locate the site, either
	 * the site name or the URL.
	 */
	async validateSiteSubscribed( identifier: string ) {
		await this.anchor.getByRole( 'link', { name: identifier } ).waitFor();
	}
}
