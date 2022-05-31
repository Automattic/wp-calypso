import { Page } from 'playwright';

/**
 * Class representing the difm-lite journey.
 */
export class DifmLiteFlow {
	selectors = {
		// Common
		input: ( index: number ) => `input >> nth=${ index }`,
		input2: ( name: string ) => `input[name="${ name }"]`,
		continue: 'button[type="submit"]',

		// difm-site-picker
		existingSite: ( index: number ) => `.site-icon >> nth=${ index }`,
		inputSearch: 'input[type="search"]',
		searchTerm: 'e2e',
		confirmSiteDeleteInput: '#confirmTextChangeInput',
		primaryCTA: 'button:text("Delete site content")',
		cancel: 'button:text("Cancel")',

		// difm-options
		siteTitleInput: 'input[name="siteTitle"]',
		siteTagLineInput: 'input[name="tagline"]',

		// social-profiles
		fbSocialInput: 'input[name="facebookUrl"]',
		twitterSocialInput: 'input[name="twitterUrl"]',
		instaSocialInput: 'input[name="instagramUrl"]',
		linkedinSocialInput: 'input[name="linkedinUrl"]',
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
	async searchExistingSites( text = this.selectors.searchTerm ) {
		// TODO: Do we want to find a way to wait for the list of sites? right now the Playwright retries seems to be enough.
		this.page.fill( this.selectors.inputSearch, text );
	}

	/**
	 * Given a number, clicks the n'th item where nth is the number parametrer passed.
	 *
	 * @param {number} number N'th site on page.
	 */
	async selectASite( number = 0 ): Promise< void > {
		// TODO: Use search existing sites to validate
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
	 * Fills site tag line at /difm-options stage of difm journey
	 *
	 * @param {string} text default is Site Tag.
	 */
	async fillSiteTitleInput( text = 'Site Title' ) {
		await Promise.all( [
			this.page.waitForSelector( this.selectors.siteTitleInput ),
			this.page.fill( this.selectors.siteTitleInput, text ),
		] );
	}

	/**
	 * Fills site tag line at /difm-options stage of difm journey
	 *
	 * @param {string} text default is Site Tag.
	 */
	async fillSiteTagInput( text = 'Site Tag' ) {
		await Promise.all( [
			this.page.waitForSelector( this.selectors.siteTagLineInput ),
			this.page.fill( this.selectors.siteTagLineInput, text ),
		] );
	}

	/**
	 * Fills in social media urls /social-profiles stage of difm journey
	 *
	 * @param {string} text default is socialUrl.
	 */
	async fillSocials( text = 'socialUrl' ) {
		this.page.fill( this.selectors.fbSocialInput, text );
		this.page.fill( this.selectors.twitterSocialInput, text );
		this.page.fill( this.selectors.instaSocialInput, text );
		this.page.fill( this.selectors.linkedinSocialInput, text );
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
