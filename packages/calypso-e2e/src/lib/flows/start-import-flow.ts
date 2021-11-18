import { Page } from 'playwright';

const selectors = {
	// Generic
	button: ( text: string ) => `button:text("${ text }")`,
	backLink: 'a:text("Back")',

	// Inputs
	urlInput: 'input.capture__input',

	// Headers
	scanningHeader: 'h1:text("Scanning your site")',

	// Buttons
	checkUrlButton: 'form.capture__input-wrapper button.action-buttons__next',
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
	 * Validates that we've landed on the URL capture page.
	 */
	async validateURLCapturePage(): Promise< void > {
		await this.page.waitForSelector( selectors.urlInput );
	}

	/**
	 * Validates that we've landed on the scanning page.
	 */
	async validateScanningPage(): Promise< void > {
		await this.page.waitForSelector( selectors.scanningHeader );
	}

	/**
	 * Validates that we've landed on the import page.
	 */
	async validateImportPage(): Promise< void > {
		await this.page.waitForSelector( selectors.button( 'Import your content' ) );
	}

	/**
	 * Enter the URL to import from.
	 *
	 * @param {string} url The source URL.
	 */
	async enterURL( url: string ): Promise< void > {
		await this.page.fill( selectors.urlInput, url );
		await this.page.click( selectors.checkUrlButton );
	}

	/**
	 * Navigate back one screen in the flow.
	 */
	async goBackOneScreen(): Promise< void > {
		await Promise.all( [ this.page.waitForNavigation(), this.page.click( selectors.backLink ) ] );
	}
}
