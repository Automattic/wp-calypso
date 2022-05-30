import { Page } from 'playwright';

/**
 * Class representing the difm-lite journey.
 */
export class DifmLiteFlow {
	selectors = {
		existingSite: ( listPosition: number ) => `.site-icon >> nth=${ listPosition }`,

		// Site deletion
		confirmSiteDeleteInput: '#confirmTextChangeInput',
		confirmSiteDeleteButton: 'button.is-primary',
	};

	private page: Page;

	/**
	 * Constructs an instance.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Given a number, clicks the n'th item where nth is the number parametrer passed.
	 *
	 * @param {number} number N'th site on page.
	 */
	async selectASite( number = 0 ): Promise< void > {
		await this.page.click( this.selectors.existingSite( number ) );
	}

	/**
	 * Enters text into the delete confirmation field.
	 *
	 * @param {string} text Text to input to check, default is DELETE.
	 */
	async fillDeleteConfirmationField( text = 'DELETE' ) {
		this.page.fill( this.selectors.confirmSiteDeleteInput, text );
	}

	/**
	 * Deletes site selected by selectASite function.
	 */
	async clickDeleteConfirmation() {
		this.page.click( this.selectors.confirmSiteDeleteButton );
	}

	/**
	 * Checks if user is on checkout by waiting for .
	 */
	async checkForCheckout() {
		await Promise.all( [ this.page.waitForSelector( '.masterbar__secure-checkout' ) ] );
	}
}
