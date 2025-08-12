import { Page } from 'playwright';

type NoticeType = 'Success' | 'Error' | 'Info';

const parent = 'div.calypso-notice';

const selectors = {
	notificationToast: ( text: string ) => `${ parent }.is-dismissable:has-text("${ text }")`,
};

/**
 * Represents the Notification component.
 *
 * There are two types of notifications in Calypso:
 * 	- dismissable
 * 	- permanent (banner)
 *
 * Dismissable type appear to float on top of the main DOM,
 * typically conveying fleeting information. Examples include
 * saving changes in the Settings page or deletion of a post.
 *
 * Permanent/banner type appears on pages conveying messages that
 * contain some permanent element. Examples include notification if
 * user is on a legacy WordPress.com plan.
 */
export class NoticeComponent {
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
		const noticeType = type ? `.is-${ type?.toLowerCase() }` : '';

		const selector = `div.calypso-notice${ noticeType } :text("${ text }")`;

		const locator = this.page.locator( selector );
		await locator.waitFor( { state: 'visible', timeout: timeout } );
	}

	/**
	 * Locate and dismiss a notification of the dismisable type.
	 *
	 * @param {string} text Banner text to locate.
	 */
	async dismiss( text: string ): Promise< void > {
		const bannerLocator = this.page.locator( selectors.notificationToast( text ) );

		const dismissLocator = bannerLocator.locator( 'button[aria-label="Dismiss"]' );
		await dismissLocator.click();
	}
}
