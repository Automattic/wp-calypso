import { Page } from 'playwright';

const selectors = {
	// Buttons on navbar
	mySiteButton: '[data-tip-target="my-sites"]',
	mobileMenuButton: '[data-tip-target="mobile-menu"]',
	editorBackButton: '[data-tip-target="back-home"]',
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
	 * Clicks on `My Sites` on the top left of Home dashboard.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickMySites(): Promise< void > {
		await this.page.click( selectors.mySiteButton );
	}

	/**
	 * Clicks on hamburger menu icon in the top left of the masterbar shown only to mobile users of calypso.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickMobileMenu(): Promise< void > {
		await this.page.click( selectors.mobileMenuButton );
	}

	/**
	 * Clicks on `<` back button on the top left of the masterbar shown only to mobile users of the editor.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickEditorBackButton(): Promise< void > {
		await this.page.click( selectors.editorBackButton );
	}

	/**
	 * Click on `Me` on top right of the Home dashboard.
	 */
	async clickMe(): Promise< void > {
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
		if ( useKeyboard ) {
			return await this.page.keyboard.type( 'n' );
		}

		const notificationsButtonLocator = this.page.locator( selectors.notificationsButton );

		return await notificationsButtonLocator.click();
	}
}
