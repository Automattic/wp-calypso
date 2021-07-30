import { Page } from 'playwright';

const selectors = {
	mySiteButton: 'text=My Site',
	writeButton: '*css=a >> text=Write',
	notificationsButton: 'a[href="/notifications"]',

	// Notification pane
	notificationsPane: '#wpnc-panel',
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
	 * Call to ensure the component is loaded before proceeding.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async waitUntilLoaded(): Promise< void > {
		await this.page.waitForLoadState( 'load' );
	}

	/**
	 * Locates and clicks on the new post button on the nav bar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickNewPost(): Promise< void > {
		await this.waitUntilLoaded();
		await this.page.click( selectors.writeButton );
	}

	/**
	 * Clicks on `My Sites` on the top left of WPCOM dashboard.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickMySites(): Promise< void > {
		await this.waitUntilLoaded();
		await this.page.click( selectors.mySiteButton );
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
		await this.waitUntilLoaded();
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

		await this.page.click( selectors.notificationsButton );
	}
}
