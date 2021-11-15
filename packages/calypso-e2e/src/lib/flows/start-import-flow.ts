import { Page } from 'playwright';

const selectors = {
	// Generic
	button: ( text: string ) => `button:text("${ text }")`,
	backLink: 'a:text("Back")',

	// Inputs
	urlInput: 'input.capture__input',
};

/**
 * Class encapsulating the flow when starting a new start importer ('/start/importer')
 */
export class StartImportFlow {
	private page: Page;

	/**
	 * Constructs an instance of the flow.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Given text, clicks on the first instance of the button with the text.
	 *
	 * @param {string} text User-visible text on the button.
	 */
	async clickButton( text: string ): Promise< void > {
		await this.page.click( selectors.button( text ) );
	}

	/**
	 * Enter the URL to import from.
	 *
	 * @param {string} url The source URL.
	 */
	async enterURL( url: string ): Promise< void > {
		await this.page.fill( selectors.urlInput, url );
	}

	/**
	 * Navigate back one screen in the flow.
	 */
	async goBackOneScreen(): Promise< void > {
		await Promise.all( [ this.page.waitForNavigation(), this.page.click( selectors.backLink ) ] );
	}
}
