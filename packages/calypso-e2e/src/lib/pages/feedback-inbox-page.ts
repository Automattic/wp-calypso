import { Page } from 'playwright';
import { envVariables } from '../..';

/**
 * Page repsresenting the Feedback page, Inbox view variant. Accessed under Sidebar > Feedback.
 */
export class FeedbackInboxPage {
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
	 * Visit the Jetpack Forms Inbox page.
	 *
	 * @param {string} siteUrlWithProtocol Site URL with the protocol.
	 */
	async visit( siteUrlWithProtocol: string ): Promise< void > {
		const url = new URL( '/wp-admin/admin.php?page=jetpack-forms-admin', siteUrlWithProtocol );
		await this.page.goto( url.href, { timeout: 20 * 1000 } );
	}

	/**
	 * Click on a response row that has the provided text.
	 *
	 * @param {string} text The text to match in the row. Using the name field is a good choice.
	 */
	async clickResponseRowByText( text: string ): Promise< void > {
		// @todo Remove `oldResponseRowLocator` option once the DataView-based inbox is deployed everywhere.
		const oldResponseRowLocator = this.page
			.locator( '.jp-forms__table-item' )
			.filter( { hasText: text } )
			.first();
		const newResponseRowLocator = this.page
			.locator( '.jp-forms__inbox__dataviews .dataviews-view-table__row' )
			.filter( { hasText: text } )
			.first();
		await newResponseRowLocator.or( oldResponseRowLocator ).waitFor();
		if ( await newResponseRowLocator.isVisible() ) {
			if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
				await newResponseRowLocator.click();
				await this.page
					.locator( '.jp-forms__inbox__dataviews .dataviews-view-table__row.is-selected' )
					.filter( { hasText: text } )
					.waitFor();
			} else {
				await newResponseRowLocator.getByRole( 'button', { name: 'View response' } ).click();
				await this.page.getByRole( 'dialog', { name: 'Response' } ).waitFor();
			}
		} else {
			await oldResponseRowLocator.click();
			if ( envVariables.VIEWPORT_NAME === 'desktop' ) {
				await this.page
					.locator( '.jp-forms__table-item.is-active' )
					.filter( { hasText: text } )
					.waitFor();
			} else {
				// On mobile, the row opens a separate view with the response that has this return link text.
				await this.page.getByText( 'View all responses' ).waitFor();
			}
		}
	}

	/**
	 * Validates a piece of text in the submitted form response.
	 *
	 * @param {string} text The text to validate.
	 * @throws If the text is not found in the response.
	 */
	async validateTextInSubmission( text: string ): Promise< void > {
		await this.page.locator( '.jp-forms__inbox-response' ).getByText( text ).first().waitFor();
	}

	/**
	 * Use the search input to search for a form response. Useful for filtering and triggering a data reload.
	 *
	 * @param {string} search The text to search for.
	 */
	async searchResponses( search: string ): Promise< void > {
		const responseRequestPromise = this.page.waitForResponse(
			( response ) =>
				// Atomic
				( response.url().includes( '/wp-json/wp/v2/feedback' ) ||
					// Simple
					response.url().match( /\/wp\/v2\/sites\/[0-9]+\/feedback/ ) ||
					// @todo Remove once once the DataView-based inbox is deployed everywhere.
					response.url().includes( '/forms/responses' ) ) &&
				response.url().includes( encodeURIComponent( search ) )
		);
		// @todo Remove the `.or( ... )` once the DataView-based inbox is deployed everywhere.
		await this.page
			.getByRole( 'searchbox', { name: 'Search' } )
			.or( this.page.getByRole( 'textbox', { name: 'Search responses' } ) )
			.fill( search );
		await responseRequestPromise;
		await this.page
			.getByRole( 'tab', { name: 'Inbox', exact: false, disabled: false } )
			.or( this.page.getByRole( 'radio', { name: /^Inbox\s*\(\d+\)$/ } ) )
			.waitFor();
	}

	/**
	 * Clears the search input.
	 */
	async clearSearch(): Promise< void > {
		// @todo Remove the `.or( ... )` once the DataView-based inbox is deployed everywhere.
		await this.page
			.getByRole( 'searchbox', { name: 'Search' } )
			.or( this.page.getByRole( 'textbox', { name: 'Search responses' } ) )
			.clear();
	}
}
