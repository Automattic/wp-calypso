import { Page } from 'playwright';

export const selectors = {
	start: 'button:text("Start a new store")',
	learnMore: 'a:text("Learn more")',
};

/**
 * Class representing the landing page at https://wordpress.com/woocommerce-installation/.
 */
export class WoocommerceLandingPage {
	private page: Page;

	/**
	 * Constructs an instance.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Click the Learn more button
	 */
	async openLearnMore(): Promise< void > {
		await this.page.waitForSelector( selectors.learnMore );
		await this.page.click( selectors.learnMore );
	}

	/**
	 * Click the Start a new store button
	 */
	async openStoreSetup(): Promise< void > {
		await this.page.waitForSelector( selectors.start );
		await this.page.click( selectors.start );
	}
}
