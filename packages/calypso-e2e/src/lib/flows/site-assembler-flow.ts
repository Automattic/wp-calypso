import { Page } from 'playwright';
type LayoutType = 'Header' | 'Sections' | 'Footer';

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
		await this.page.getByRole( 'button', { name: text } ).click();
	}

	/**
	 * Given two parameters, type and index, selects a layout component matching
	 * the specifications.
	 *
	 * @param {LayoutType} type Type of the layout component.
	 * @param {number} index Index of the item to choose. Defaults to 0.
	 */
	async selectLayoutComponent( type: LayoutType, index = 0 ): Promise< void > {
		await this.page.getByRole( 'button', { name: type } ).click();
		await this.page.waitForLoadState( 'networkidle' );

		await this.page.locator( '.pattern-list-renderer__pattern-list-item' ).nth( index ).click();
	}
}
