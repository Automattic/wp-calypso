import { Page } from 'playwright';

const selectors = {
	acceptCookie: '.a8c-cookie-banner__ok-button',
};

/**
 * Represents the cookie banner shown on pages when not logged in.
 */
export class CookieBannerComponent {
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
	 * Accept and clear the cookie notice.
	 */
	async acceptCookie(): Promise< void > {
		const locator = this.page.locator( selectors.acceptCookie );

		// If it is not present, exit early.
		if ( ( await locator.count() ) === 0 ) {
			return;
		}

		await locator.click();
	}
}
