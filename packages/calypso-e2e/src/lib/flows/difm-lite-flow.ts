import { Page } from 'playwright';

/**
 * Class representing the difm-lite journey.
 */
export class DifmLiteFlow {
	selectors = {
		// Common
		existingSite: ( index: number ) => `.site-icon >> nth=${ index }`,
		input: ( index: number ) => `input >> nth=${ index }`,
		continue: 'button[type="submit"]',

		// /do-it-for-me/difm-site-picker
		search: 'input[type="search"]',
		confirmSiteDeleteInput: '#confirmTextChangeInput',
		primaryCTA: 'button:text("Delete site content")',
		cancel: 'button:text("Cancel")',

		// /do-it-for-me/difm-options
		siteTitleInput: 'input[name="siteTitle"]',
		siteTagLineInput: 'input[name="tagline"]',
	};

	private page: Page;

	/**
	 * Constructs an instance.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Enters text into the delete confirmation field.
	 *
	 * @param {string} text Text to input to check, default is DELETE.
	 */
	async searchExistingSites( text = 'e2e' ) {
		this.page.fill( this.selectors.search, text );
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
		this.page.click( this.selectors.primaryCTA );
	}

	/**
	 * Fills site title at /do-it-for-me/difm-options stage of difm journey
	 *
	 * * @param {string} text default is Site Title plus current date (to give the ).
	 */
	async fillSiteTitleInput( text = 'Site Title' ) {
		this.page.fill( this.selectors.siteTitleInput, text );
	}

	/**
	 * Clicks button with type=submit
	 */
	async pressContinueButton() {
		this.page.click( this.selectors.continue );
	}

	/**
	 * Checks if user is on checkout by waiting for .
	 */
	async checkForCheckout() {
		await Promise.all( [ this.page.waitForSelector( '.masterbar__secure-checkout' ) ] );
	}
}
