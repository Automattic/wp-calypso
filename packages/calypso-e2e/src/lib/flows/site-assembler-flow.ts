import { Page } from 'playwright';

const selectors = {
	button: ( text: string ) => `button:text("${ text }")`,
	blockRenderer: '.block-renderer',
};

/**
 * Class encapsulating the Site Assembler flow
 */
export class SiteAssemblerFlow {
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
	 * Select Header
	 */
	async selectHeader(): Promise< void > {
		await this.page.getByText( 'Header' ).click();
		const header = this.page.locator( selectors.blockRenderer ).nth( 0 );
		await header.click();
	}

	/**
	 * Select Footer
	 */
	async selectFooter(): Promise< void > {
		await this.page.getByText( 'Footer' ).click();
		const footer = this.page.locator( selectors.blockRenderer ).nth( 0 );
		await footer.click();
	}

	/**
	 * Click "Continue" and land on the Site Editor
	 */
	async gotoSiteEditor(): Promise< void > {
		// Wait for the "Continue" button to be enabled.
		// @see: https://github.com/Automattic/wp-calypso/pull/75606
		const waitFor = ( ms: number ) => new Promise( ( resolve ) => setTimeout( resolve, ms ) );
		await waitFor( 500 );
		await this.clickButton( 'Continue' );
	}
}
