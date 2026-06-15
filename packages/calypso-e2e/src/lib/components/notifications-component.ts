import { Locator, Page } from 'playwright';

/**
 * Component representing the notifications panel and notifications themselves.
 */
export class NotificationsComponent {
	private page: Page;
	private anchor: Locator;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
		// There is no accessible locator for this panel.
		this.anchor = page.locator( 'div[id=wpnc-panel]' );
	}

	/**
	 * Given a string of text, locate and click on the notification containing the text.
	 *
	 * @param {string} text Text contained in the notification.
	 * @returns {Promise<void>} No return value.
	 */
	async openNotification( text: string ): Promise< void > {
		await this.anchor.getByText( text ).click();
	}

	/**
	 * Given a string of text, click on the button in expanded single notification view to execute the action.
	 *
	 * eg. 'Trash' -> Clicks on the 'Trash' button when viewing a single notification.
	 *
	 * @param {string} action Action to perform on the notification.
	 */
	async clickNotificationAction( action: string ): Promise< void > {
		await this.anchor
			.getByRole( 'list' )
			.getByRole( 'button' )
			.filter( { hasText: action } )
			.click();
	}

	/**
	 * Clicks the undo link to undo the previous action.
	 */
	async clickUndo(): Promise< void > {
		await this.anchor.getByRole( 'button', { name: 'Undo', exact: true } ).click();
		await this.anchor.getByText( 'Comment trashed' ).waitFor( { state: 'detached' } );
	}
}
