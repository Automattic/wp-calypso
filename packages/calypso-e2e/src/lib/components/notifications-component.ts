import { ElementHandle, Page } from 'playwright';

const selectors = {
	comment: '.wpnc__comment',
	singleViewPanel: '.wpnc__single-view',
	undoLocator: '.wpnc__summary.wpnc__undo-item',
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
	 * Locates and returns an ElementHandle to the notification.
	 *
	 * @param {string} text Text by which the notification should be located.
	 * @returns {Promise<ElementHandle} Reference to the notification element.
	 */
	async getNotification( text: string ): Promise< ElementHandle > {
		// Currently, only text selector is supported, but eventually it may make sense
		// to implement a numerical selector as well.
		const selector = `*css=${ selectors.comment } >> text=${ text }`;
		return await this.page.waitForSelector( selector );
	}

	/**
	 * Given a string of text, locate and click on the notification containing the text.
	 *
	 * @param {string} text Text contained in the notification.
	 * @returns {Promise<void>} No return value.
	 */
	async clickNotification( text: string ): Promise< void > {
		const notification = await this.getNotification( text );
		await notification.click();
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
		const selector = `*css=button >> text=${ action }`;
		await this.page.click( selector );

		if ( action === 'Trash' ) {
			await this.page.waitForSelector( ':text("Comment trashed")', { state: 'hidden' } );
		}
	}

	/**
	 * Waits for undo message to appear
	 *
	 * @returns {Promise<void>} No return value.
	 */
	async waitForUndoMessage(): Promise< void > {
		await this.page.$( selectors.undoLocator );
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
