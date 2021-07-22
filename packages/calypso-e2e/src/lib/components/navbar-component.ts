import { BaseContainer } from '../base-container';

const selectors = {
	mySiteButton: 'text=My Site',
	writeButton: '*css=a >> text=Write',
	notificationsButton: 'a[href="/notifications"]',

	// Notification pane
	notificationsPane: '#wpnc-panel',
};
/**
 * Component representing the navbar/masterbar at top of WPCOM.
 *
 * @augments {BaseContainer}
 */
export class NavbarComponent extends BaseContainer {
	/**
	 * Locates and clicks on the new post button on the nav bar.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickNewPost(): Promise< void > {
		await this.page.click( selectors.writeButton );
	}

	/**
	 * Clicks on `My Sites` on the top left of WPCOM dashboard.
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async clickMySites(): Promise< void > {
		await this.page.click( selectors.mySiteButton );
	}

	/**
	 * Opens the notification panel.
	 *
	 * Optionally, set the `keyboard` parameter to trigger this action using keyboard shortcut.
	 *
	 * @param {{[key: string]: string}} [param0] Object assembled by the caller.
	 * @param {string} param0.keyboard Set to true to use keyboard shortcut to open the notifications panel. Defaults to false.
	 * @returns {Promise<void>} No return value.
	 */
	async openNotificationsPanel( {
		keyboard = false,
	}: { keyboard?: boolean } = {} ): Promise< void > {
		await this.page.waitForSelector( selectors.notificationsButton );
		if ( keyboard ) {
			return await this.page.keyboard.press( 'n' );
		}

		await this.page.click( selectors.notificationsButton );
	}
}
