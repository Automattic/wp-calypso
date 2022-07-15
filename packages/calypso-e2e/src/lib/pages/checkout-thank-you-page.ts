import { Page } from 'playwright';

/**
 * Represents the page that is shown post-checkout.
 *
 * This screen is only shown when a user checks out an upgrade
 * on an existing site *outside* of the onboarding flow.
 */
export class CheckoutThankYouPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Clicks on a button that has matching string.
	 *
	 * @param {string} text Text to match on.
	 */
	async clickButton( text: string ): Promise< void > {
		const locator = this.page.locator( `a:has-text("${ text }"), button:has-text("${ text }")` );

		await locator.click();
	}
}
