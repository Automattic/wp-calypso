import { Page } from 'playwright';

const selectors = {
	// Buttons on navbar
	mySiteButton: '[data-tip-target="my-sites"]',
	writeButton: '.masterbar__item-new',
	notificationsButton: 'a[href="/notifications"]',
	meButton: 'a[data-tip-target="me"]',
};
/**
 * Component representing the navbar/masterbar at top of WPCOM.
 */
export class NavbarComponent {
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
	 * Wait for load state of the page.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	private async pageSettled(): Promise< void > {
		await this.page.waitForLoadState( 'load' );
	}

	/**
	 * Locates and clicks on the new post button on the nav bar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickNewPost(): Promise< void > {
		await this.pageSettled();
		await this.page.click( selectors.writeButton );
	}

	/**
	 * Clicks on `My Sites` on the top left of Home dashboard.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickMySites(): Promise< void > {
		await this.pageSettled();
		await this.page.click( selectors.mySiteButton );
	}

	/**
	 * Click on `Me` on top right of the Home dashboard.
	 */
	async clickMe(): Promise< void > {
		await this.pageSettled();
		await Promise.all( [ this.page.waitForNavigation(), this.page.click( selectors.meButton ) ] );
	}

	/**
	 * Opens the notification panel.
	 *
	 * Optionally, set the `keyboard` parameter to trigger this action using keyboard shortcut.
	 *
	 * @param {{[key: string]: string}} [param0] Object assembled by the caller.
	 * @param {string} param0.useKeyboard Set to true to use keyboard shortcut to open the notifications panel. Defaults to false.
	 * @returns {Promise<void>} No return value.
	 */
	async openNotificationsPanel( {
		useKeyboard = false,
	}: { useKeyboard?: boolean } = {} ): Promise< void > {
		await this.pageSettled();

		const notificationsButton = await this.page.waitForSelector( selectors.notificationsButton, {
			state: 'visible',
		} );
		await Promise.all( [
			this.page.waitForLoadState( 'networkidle' ),
			notificationsButton.waitForElementState( 'stable' ),
		] );

		if ( useKeyboard ) {
			return await this.page.keyboard.type( 'n' );
		}

		return await this.page.click( selectors.notificationsButton );
	}
}
