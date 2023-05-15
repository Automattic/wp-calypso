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
		const target = this.page
			.getByRole( 'listbox', { name: 'Block patterns' } )
			.getByRole( 'option' )
			.nth( index )
			.locator( 'iframe' );

		// The iframe has an attribute of "height" that is present only if the preview has loaded.
		// By checking for the presence of the "height" attribute on the last visible
		// iframe, we can be sure that all visible component card has loaded.
		// If the last iframe does not yet contain the "height" attribute, then wait
		// for a predetermined timeout, then re-evaluate.
		while (
			! ( await target.evaluate( ( element ) => {
				if ( element.style.height ) {
					return true;
				}
				return false;
			} ) )
		) {
			await this.page.waitForTimeout( 1000 );
		}

		await target.click();
	}
}
