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

		// Each header element contains an iframe that loads the preview in the card.
		// These previews are lazy-loaded and thus only load if the card is in the
		// viewport.
		// By waiting for the network activity to cease for the lazy-load,
		// mis-clicks and clicks being swallowed can be prevented.
		await this.page.waitForLoadState( 'networkidle', { timeout: 15 * 1000 } );
	}

	/**
	 * Selects a layout component at matching index.
	 *
	 * @param {number} index Index of the item to choose. Defaults to 0.
	 */
	async selectLayoutComponent( index = 0 ): Promise< void > {
		await this.page.locator( '.pattern-list-renderer__pattern-list-item' ).nth( index ).click();
	}
}
