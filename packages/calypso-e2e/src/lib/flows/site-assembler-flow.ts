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
	 * Given a component type, clicks on the heading item to show available components.
	 *
	 * @param {LayoutType} type Type of the layout component.
	 */
	async selectLayoutComponentType( type: LayoutType ): Promise< void > {
		await this.page.getByRole( 'button', { name: type } ).click();
	}

	/**
	 * Selects a layout component at matching index.
	 *
	 * @param {number} index Index of the item to choose. Defaults to 0.
	 */
	async selectLayoutComponent( index = 0 ): Promise< void > {
		await this.page
			.getByRole( 'listbox', { name: 'Block patterns' } )
			.getByRole( 'option' )
			.nth( index )
			// Pierce through the iframe holding the component preview.
			.frameLocator( 'iframe' )
			.locator( '.block-editor-iframe__body' )
			.click();
	}
}
