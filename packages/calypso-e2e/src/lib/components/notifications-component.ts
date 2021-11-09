import { Page } from 'playwright';

const selectors = {
	// Notifications panel (including sub-panels)
	activeSingleViewPanel: '.wpnc__single-view.wpnc__current',
	notification: ( text: string ) => `.wpnc__comment:has-text("${ text }")`,

	// Comment actions
	commentAction: ( action: string ) => `button.wpnc__action-link:has-text("${ action }"):visible`,
	undoLocator: '.wpnc__undo-item',
};
/**
 * Component representing the notifications panel and notifications themselves.
 */
export class NotificationsComponent {
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
	 * Given a string of text, locate and click on the notification containing the text.
	 *
	 * @param {string} text Text contained in the notification.
	 * @returns {Promise<void>} No return value.
	 */
	async clickNotification( text: string ): Promise< void > {
		await this.page.click( selectors.notification( text ) );
	}

	/**
	 * Given a string of text, click on the button in expanded single notification view to execute the action.
	 *
	 * eg. 'Trash' -> Clicks on the 'Trash' button when viewing a single notification.
	 *
	 * @param {string} action Predefined list of strings that are accepted.
	 * @returns {Promise<void>} No return value.
	 */
	async clickNotificationAction( action: 'Trash' ): Promise< void > {
		// we need to make sure we're in a specific notification view before proceeding with the individual action
		const elementHandle = await this.page.waitForSelector( selectors.activeSingleViewPanel );
		await elementHandle.waitForElementState( 'stable' );
		await this.page.click( selectors.commentAction( action ) );
	}

	/**
	 * Waits for undo message to appear
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async waitForUndoMessage(): Promise< void > {
		await this.page.waitForSelector( selectors.undoLocator );
	}

	/**
	 * Waits for undo message to disappear
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async waitForUndoMessageToDisappear(): Promise< void > {
		await this.page.waitForSelector( selectors.undoLocator, { state: 'hidden' } );
	}
}
