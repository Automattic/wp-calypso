/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';
import * as driverHelper from '../../driver-helper';

class LayoutGridBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Layout Grid';
	static blockName = 'jetpack/layout-grid';

	// TODO Simplify this selector, given the block ID, a simpler CSS selector will work here
	fileInputSelector = By.xpath(
		`//*[@id="${ this.blockID.slice( 1 ) }"]/div/div/div[3]/div[2]/input`
	);

	async setupColumns( no ) {
		const columnButtonSelector = By.css( `${ this.blockID } button[aria-label="${ no } columns"]` );
		await driverHelper.clickWhenClickable( this.driver, columnButtonSelector );
	}

	/**
	 * Inserts a block into the specified grid column using the Quick Inserter.
	 *
	 * I'm not sure if this belongs here or extracted into a method in the GutenbergEditorComponent or maybe
	 * its own QuickInserter class. I'll figure out later.
	 * Also, the block wrapper div changes after you setup the number of columns you want. This makes it tricky
	 * to scope the elements to the original block. I'm for now brute-forcing the selection by using a more
	 * general selector.
	 *
	 * This probably won't support multiple instances of the same block. It hasn't been tested
	 * with multiple layout grids on the page either, but it works fine for simple scenarios.
	 *
	 * @param { typeof GutenbergBlockComponent } blockClass A block class that responds to blockTitle and blockName
	 * @param { number } column number to insert it into, from left to right, starts with 0.
	 * @returns { GutenbergBlockComponent } instance of the added block
	 **/
	async insertBlock( blockClass, column ) {
		const addColumnButtonsSelector = By.css(
			`.wp-block-jetpack-layout-grid button[aria-label="Add block"]`
		);
		const allButtons = await this.driver.findElements( addColumnButtonsSelector );

		await allButtons[ column ].click();

		const inserterSearchInputSelector = By.css( 'input.block-editor-inserter__search-input' );

		await driverHelper.setWhenSettable(
			this.driver,
			inserterSearchInputSelector,
			blockClass.blockTitle
		);

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `button.editor-block-list-item-${ blockClass.blockName.replace( '/', '-' ) }` )
		);

		const insertedBlockSelector = By.css(
			`.wp-block-jetpack-layout-grid .block-editor-block-list__block[aria-label='Block: ${ blockClass.blockTitle }']`
		);
		const blockId = await this.driver.findElement( insertedBlockSelector ).getAttribute( 'id' );

		return blockClass.Expect( this.driver, blockId );
	}
}

export { LayoutGridBlockComponent };
