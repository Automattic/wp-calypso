import { Page } from 'playwright';

type NoticeType = 'Success' | 'Error' | 'Info';

const selectors = {
	dismissButton: 'button[aria-label="Dismiss"]',
};

/**
 * Represents the Snackbar Notice compoonent.
 *
 * These are elements that appear to float on top of the main DOM
 * and typically carry information about an action performed on a page
 * that results in forced navigation.
 */
export class SnackbarNotificationComponent {
	private page: Page;

	/**
	 * Creates an instance of the component.
	 *
	 * @param {Page} page Object representing the base page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Verifies the content of the snackbar notice on page.
	 *
	 * This method requires either full or partial text of the snackbar notice
	 * to be supplied as parameter.
	 *
	 * Optionally, it is possible to specify the `type` parameter to limit
	 * validation to a certain type of snackbar notices eg. `error`.
	 *
	 * @param {string} text Full or partial text to validate on page.
	 * @param param1 Optional parameters.
	 * @param {NoticeType} param1.type Type of snackbar notice to limit validation to.
	 * @returns {Promise<boolean>} True if text is found in target snackbar notice.
	 * 	False otherwise.
	 */
	async noticeShown( text: string, { type }: { type?: NoticeType } = {} ): Promise< boolean > {
		const noticeType = `.is-${ type?.toLowerCase() }` || '';

		const selector = `div.notice${ noticeType } :text("${ text }")`;

		const locator = this.page.locator( selector );
		await locator.waitFor( { state: 'visible' } );

		return Boolean( await locator.count() );
	}

	/**
	 * Dismiss a Snackbar Notification.
	 */
	async dismiss(): Promise< void > {
		const locator = this.page.locator( selectors.dismissButton );
		await locator.click();
	}
}
