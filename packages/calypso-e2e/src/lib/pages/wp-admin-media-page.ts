import { Page } from 'playwright';

const selectors = {
	items: '.attachments',
};

/**
 * Represents an instance of the WPCOM Media library page.
 */
export class WPAdminMediaPage {
	private page: Page;

	/**
	 * Constructs an instance of the component.
	 *
	 * @param {Page} page The underlying page.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Given either a 1-indexed number `n` or the file name, click and select the item.
	 *
	 * Note that if an index is passed and the media gallery has been
	 * filtered (eg. Images only), this method will select the `nth`
	 * item in the filtered gallery as shown.
	 *
	 * @param param0 Keyed object parameter.
	 * @param {number} param0.index 1-indexed value denoting the nth media gallery item to be selected.
	 * @param {string} param0.name Filename of the media gallery item to be selected.
	 * @throws {Error} If requested item could not be located in the gallery, or if the click action failed to select the gallery item.
	 */
	async selectItem( { index, name }: { index?: number; name?: string } = {} ) {
		if ( ! index && ! name ) {
			throw new Error( 'Specify either index or name.' );
		}

		if ( index ) {
			const elementHandle = await this.page.waitForSelector(
				`:nth-match(${ selectors.items }, ${ index })`
			);
			await elementHandle.click();
			await this.page.waitForFunction(
				( element: SVGElement | HTMLElement ) => element.classList.contains( 'is-selected' ),
				elementHandle
			);
		}
		if ( name ) {
			const locator = this.page.locator( selectors.items ).getByLabel( name );
			await locator.click();

			const selectedItemName = await this.page
				.getByRole( 'textbox', { name: 'Title' } )
				.getAttribute( 'value' );

			if ( selectedItemName !== name ) {
				throw new Error( `Expected title to be "${ name }", but got "${ selectedItemName }".` );
			}
		}
	}
}
