import { Page } from 'playwright';

type NoticeType = 'Updated';

/**
 * Represents the Notification component.
 */
export class WpAdminNoticeComponent {
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
	 * Verifies the content in a notification on the page.
	 *
	 * This method requires either full or partial text of
	 * the notification to be supplied as parameter.
	 *
	 * Optionally, it is possible to specify the `type` parameter to limit
	 * validation to a certain type of notifications eg. `error`.
	 *
	 * @param {string} text Full or partial text to validate on page.
	 * @param param1 Optional parameters.
	 * @param {NoticeType} param1.type Type of notice to limit validation to.
	 * @param {number} param1.timeout Custom timeout value.
	 */
	async noticeShown(
		text: string,
		{ type, timeout }: { type?: NoticeType; timeout?: number } = {}
	): Promise< void > {
		const noticeType = type ? `.${ type.toLowerCase() }` : '';

		const selector = `div.notice${ noticeType } :text("${ text }")`;

		const locator = this.page.locator( selector );
		await locator.waitFor( { state: 'visible', timeout: timeout } );
	}
}
