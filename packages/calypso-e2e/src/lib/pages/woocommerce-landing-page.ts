import { Page } from 'playwright';

export const selectors = {
	start: '.woocommerce .empty-content button:text("Start a new store")',
	installer: '.is-woocommerce-install',
	learnMore: '.woocommerce span:text("Learn more")',
	supportDialog: '.support-article-dialog',
	supportDialogClose: '.support-article-dialog button:text("Close")',
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
		await this.page.click( selectors.learnMore );
		await this.page.waitForSelector( selectors.supportDialog );
		await this.page.click( selectors.supportDialogClose );
	}

	/**
	 * Click the Start a new store button
	 */
	async openStoreSetup(): Promise< void > {
		await this.page.click( selectors.start );
		await this.page.waitForSelector( selectors.installer );
	}
}
