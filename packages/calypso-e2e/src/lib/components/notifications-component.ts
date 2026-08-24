import { Locator, Page } from 'playwright';

/**
 * Component representing the notifications panel and notifications themselves.
 */
export class NotificationsComponent {
	private page: Page;
	private anchor: Locator;
	private detailPane: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		// The redesigned panel renders inside a portaled popover; `.wpnc-app` is
		// its root. There is no accessible landmark for it.
		this.anchor = page.locator( '.wpnc-app' );
		// The selected note's detail view, where the per-note actions live. Scoping
		// to this pane disambiguates the note's Actions menu from the panel-level
		// Actions menu in the list pane.
		this.detailPane = this.anchor.locator( '.wpnc-app__detail-pane' );
	}

	/**
	 * Given a string of text, locate and click on the notification containing the text.
	 *
	 * @param {string} text Text contained in the notification.
	 * @returns {Promise<void>} No return value.
	 */
	async openNotification( text: string ): Promise< void > {
		// In the DataViews list each row is an absolutely-positioned
		// `.dataviews-view-list__item` button overlaying its content, so clicking
		// the matched text node is intercepted. Click the row button of the
		// article that contains the text instead.
		await this.anchor
			.locator( '.wpnc-app__list-pane' )
			.locator( '[role="article"]', { hasText: text } )
			.locator( '.dataviews-view-list__item' )
			.click();
	}

	/**
	 * Given a string of text, click on the inline action button in the expanded single
	 * notification view to execute the action.
	 *
	 * eg. 'Approve' -> Clicks on the 'Approve' button when viewing a single notification.
	 *
	 * @param {string} action Action to perform on the notification.
	 */
	async clickNotificationAction( action: string ): Promise< void > {
		await this.detailPane.getByRole( 'button', { name: action, exact: true } ).click();
	}

	/**
	 * Trashes the open notification's comment.
	 *
	 * Trash lives inside the per-note "Actions" dropdown, whose popover animates
	 * and can detach mid-interaction. The panel exposes a dedicated `t` shortcut
	 * for the same action, which is more reliable to drive.
	 */
	async trashNotification(): Promise< void > {
		await this.page.keyboard.press( 't' );
	}
}
