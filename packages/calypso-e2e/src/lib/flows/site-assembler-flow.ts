import { Locator, Page } from 'playwright';
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
	async clickLayoutComponentType( type: LayoutType ): Promise< void > {
		await this.page.getByRole( 'button', { name: type } ).click();
	}

	/**
	 * Selects a site assembler component in one of two ways: name or index-based.
	 *
	 * If supplied with the an accessible name of the component or a valid index,
	 * this method will locate the target, insert it, then validate the insertion
	 * was successful.
	 *
	 * The index is 0-indexed.
	 *
	 * @param param0 Keyed object parameter.
	 * @param {string} param0.name Exact name of the component to select.
	 * @param {string} param0.index 0-indexed index of the component to select.
	 * @throws {Error} If neither name or index was specified.
	 */
	async selectLayoutComponent( {
		name,
		index,
	}: { name?: string; index?: number } = {} ): Promise< void > {
		// To reduce network load times, abort any request for
		// placeholder images.
		await this.page.route( '**/*.png', ( route ) => {
			route.abort( 'aborted' );
		} );

		const initialCount = await this.getAssembledComponentsCount();

		let target: Locator;
		if ( name ) {
			target = this.page
				.getByRole( 'listbox', { name: 'Block patterns' } )
				.getByRole( 'option', { name: name, exact: true } );
		} else if ( index !== undefined ) {
			target = this.page
				.getByRole( 'listbox', { name: 'Block patterns' } )
				.getByRole( 'option' )
				.nth( index );
		} else {
			throw new Error(
				`Must specify either name-based or index-based targeting of the component.`
			);
		}

		await target.scrollIntoViewIfNeeded();
		await target.click();

		// The inserted component may not immediately be inserted into the preview,
		// especially on slower connections or a weaker CPU.
		// Wait for the last component to be visible by comparing the number of components
		// in the preview pane.
		while ( true ) {
			const newCount = await this.getAssembledComponentsCount();

			if ( newCount > initialCount ) {
				break;
			}
		}
	}

	/**
	 * Given an accessible name of the color style, waits for and clicks on the style.
	 *
	 * @param {string} name Accessible name of the color style to pick.
	 */
	async pickStyle( name: string ) {
		const anchor = this.page.getByRole( 'listbox', { name: 'Color palette variations' } );
		await anchor.waitFor();

		await anchor.getByRole( 'option', { name: name } ).click();
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
