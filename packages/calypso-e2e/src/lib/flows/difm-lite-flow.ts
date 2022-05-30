import { Page } from 'playwright';

const selectors = {
	selectExistingSite: '.button__select-items__item-button:text("Select a site")',
};

/**
 * Class representing the landing page at https://wordpress.com/woocommerce-installation/.
 */
export class DifmLiteFlow {
	private page: Page;

	/**
	 * Constructs an instance.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Click the Select a site button
	 */
	async clickSelectSite(): Promise< void > {
		await this.page.waitForSelector( selectors.selectExistingSite );
		await this.page.click( selectors.selectExistingSite );
	}

	/**
	 * SC Check URL
	 */
	async urlIsCheckout(): Promise< void > {
		await this.page.url().includes( '/checkout' );
	}

	/**
	 * Click the Start a new store button
	 */
	// async openStoreSetup(): Promise< void > {
	// 	await this.page.click( selectors.start );
	// 	await this.page.waitForSelector( selectors.installer );
	// }
}
