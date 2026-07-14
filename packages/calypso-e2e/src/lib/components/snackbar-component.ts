import { Page } from 'playwright';

/**
 * Represents the snackbar notices shown by the Multi-site Dashboard.
 *
 * The dashboard uses these instead of the classic Calypso notices covered by
 * `NoticeComponent`.
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
	 * Snackbars auto-dismiss, so await this as soon as the triggering action resolves.
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
