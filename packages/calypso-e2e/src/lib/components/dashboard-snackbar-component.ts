import { Page } from 'playwright';

const selectors = {
	snackbar: '.components-snackbar',
};

/**
 * Escapes regular expression metacharacters in the given text.
 *
 * @param text Text to escape.
 */
const escapeForRegExp = ( text: string ) => text.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );

/**
 * Represents the snackbar notices of the Multi-site Dashboard.
 *
 * The dashboard surfaces transient feedback through `@wordpress/notices`
 * snackbars (`client/dashboard/app/snackbars`) rather than the Calypso notices
 * covered by `NoticeComponent`.
 */
export class DashboardSnackbarComponent {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param page Page on which the interactions take place.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Verifies a snackbar with the given text is shown.
	 *
	 * Snackbars can auto-dismiss, so callers should assert as soon as the action
	 * that triggers the snackbar has settled.
	 *
	 * @param text Full or partial text to validate on page.
	 * @param options Options.
	 * @param options.timeout Custom timeout value.
	 * @param options.exact Whether the snackbar text must match `text` exactly.
	 */
	async noticeShown(
		text: string,
		{ timeout, exact }: { timeout?: number; exact: boolean }
	): Promise< void > {
		await this.page
			.locator( selectors.snackbar )
			.filter( { hasText: exact ? new RegExp( `^\\s*${ escapeForRegExp( text ) }\\s*$` ) : text } )
			.first()
			.waitFor( { state: 'visible', timeout: timeout } );
	}
}
