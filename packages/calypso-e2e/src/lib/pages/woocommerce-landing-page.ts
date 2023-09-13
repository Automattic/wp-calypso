import { Page } from 'playwright';

const selectors = {
	start: '.woocommerce .empty-content button:text("Start a new store")',
	installer: '.is-woocommerce-install',
	learnMore: '.woocommerce span:text("Learn more")',
	helpCenter: '.help-center__container',
	helpCenterClose: '.help-center__container .help-center-header__close',
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
		await this.page.waitForSelector( selectors.helpCenter );
	}

	/**
	 * Click the Close button
	 */
	async closeLearnMore(): Promise< void > {
		await this.page.click( selectors.helpCenterClose );
	}

	/**
	 * Click the Start a new store button
	 */
	async openStoreSetup(): Promise< void > {
		await this.page.click( selectors.start );
		await this.page.waitForSelector( selectors.installer );
	}
}
