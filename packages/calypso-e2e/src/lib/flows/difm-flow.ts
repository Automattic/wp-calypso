import { Page } from 'playwright';
import { DataHelper } from '../..';

const selectors = {
	// General
	button: ( text: string ) => `button:text("${ text }")`,

	// Start page
	startContainer: '.signup.is-do-it-for-me',

	// Options page
	siteName: '#siteTitle',
	tagline: '#tagline',

	// Social page
	facebook: 'input[name=facebookUrl]',
};

/**
 * Class encapsulating the flow when starting a new do-it-for-me site order.
 */
export class DIFMFlow {
	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( private page: Page ) {}

	/**
	 * Given text, click on the button's first instance with the text.
	 *
	 * @param {string} text User-visible text on the button.
	 */
	async clickButton( text: string ): Promise< void > {
		const selector = selectors.button( text );

		await this.page.waitForSelector( selector );
		await this.page.click( selector );
	}

	/**
	 * Go to first setup page.
	 */
	async startSetup(): Promise< void > {
		await this.page.goto(
			DataHelper.getCalypsoURL(
				'/start/do-it-for-me/new-or-existing-site?flags=signup/redesigned-difm-flow'
			)
		);
		await this.validateSetupPage();
		await this.clickButton( 'Start a new site' );
	}

	/**
	 * Validates that we've landed on the setup page.
	 */
	async validateSetupPage(): Promise< void > {
		await this.page.waitForSelector( selectors.startContainer );
	}

	/**
	 * Validates that we've landed on the options page.
	 */
	async validateOptionsPage(): Promise< void > {
		await this.page.waitForSelector( selectors.siteName );
	}

	/**
	 * Validates that we've landed on the social page.
	 */
	async validateSocialPage(): Promise< void > {
		await this.page.waitForSelector( selectors.facebook );
	}

	/**
	 * Enter the values for your site name as well as an optional tagline.
	 *
	 * @param {string} name The name for the new site.
	 * @param {string} [tagline] An optional tagline.
	 */
	async enterOptions( name: string, tagline?: string ): Promise< void > {
		await this.page.fill( selectors.siteName, name );
		if ( typeof tagline !== 'undefined' ) {
			await this.page.fill( selectors.tagline, tagline );
		}
		await this.clickButton( 'Continue' );
	}
}
