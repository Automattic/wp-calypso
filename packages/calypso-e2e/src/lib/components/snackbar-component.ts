import { Page } from 'playwright';

/**
 * Represents the transient snackbar notices shown by the Multi-site Dashboard.
 *
 * The dashboard reports the outcome of an action through a `@wordpress/notices`
 * snackbar, rather than through the classic Calypso notice that
 * `NoticeComponent` covers.
 */
export class SnackbarComponent {
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
	 * Verifies that a snackbar with the given text is shown.
	 *
	 * Snackbars auto-dismiss, so this must be awaited while the snackbar is still
	 * on screen — that is, as soon as the action that triggers it has resolved.
	 *
	 * @param {string} text Full or partial text to validate on page.
	 * @param param1 Optional parameters.
	 * @param {number} param1.timeout Custom timeout value.
	 */
	async snackbarShown( text: string, { timeout }: { timeout?: number } = {} ): Promise< void > {
		await this.page
			.locator( '.components-snackbar' )
			.filter( { hasText: text } )
			.first()
			.waitFor( { state: 'visible', timeout } );
	}
}
