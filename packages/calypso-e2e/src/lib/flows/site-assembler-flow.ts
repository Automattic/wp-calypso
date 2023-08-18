import { Page } from 'playwright';
type LayoutType = 'Header' | 'Sections' | 'Footer';

/**
 * Class encapsulating the Site Assembler flow.
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
	 * Selects a site assembler component with the given name from the
	 * list of available components, inserts it, then validate the insertion
	 * was successful.
	 *
	 * The name has to match exactly to the string in the tooltip.
	 *
	 * @param {string} name Exact name of the component to select.
	 */
	async selectLayoutComponent( name: string ): Promise< void > {
		// To reduce network load times, abort any request for
		// placeholder images.
		await this.page.route( '**/*.png', ( route ) => {
			route.abort( 'aborted' );
		} );

		const target = this.page
			.getByRole( 'listbox', { name: 'Block patterns' } )
			.getByRole( 'option', { name: name, exact: true } );

		await target.scrollIntoViewIfNeeded();
		await target.click();

		// The inserted component does not load immediately, especially on
		// slower networks or a weaker CPU.
		// Wait for the last component to be visible.
		// Note, component being visible do not necessarily mean
		// the preview images are visible.
		await this.page
			.locator( '.device-switcher__viewport' )
			.getByRole( 'list' )
			.getByRole( 'listitem' )
			.last()
			.waitFor( { timeout: 15 * 1000 } );
	}

	/**
	 * Returns the number of components added to the Site Assembler preview pane.
	 *
	 * @returns {Promise<number>} Number of components in the preview pane.
	 */
	async getAssembledComponentsCount(): Promise< number > {
		// CSS selector must be used as the anchor due to the preview panel
		// not having an accessible name.
		return await this.page
			.locator( '.device-switcher__viewport' )
			.getByRole( 'list' )
			.getByRole( 'listitem' )
			.count();
	}
}
