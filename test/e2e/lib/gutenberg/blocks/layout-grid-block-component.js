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
	static blockFrontendSelector = By.css( '.entry-content .wp-block-jetpack-layout-grid' );

	/**
	 * Setups the number of columns for the layout grid block.
	 *
	 * This needs to be called before you call @see {@link insertBlock}.
	 *
	 * @param {number} no number of columns, 1 to 4 (based on the default buttons in the block).
	 */
	async setupColumns( no ) {
		const columnButtonSelector = By.css( `${ this.blockID } button[aria-label="${ no } columns"]` );
		await driverHelper.clickWhenClickable( this.driver, columnButtonSelector );

		// Updates the blockId, since the block is replaced by another one upon the selection of the columns.
		this.blockID = await this.driver
			.findElement( By.css( 'div.block-editor-block-list__block.is-selected' ) )
			.getAttribute( 'id' );

		const addColumnButtonsSelector = By.css(
			`div[id="${ this.blockID }"] div.wp-block-jetpack-layout-grid button[aria-label="Add block"]`
		);

		this.addBlockButtons = await this.driver.findElements( addColumnButtonsSelector );
	}

	/**
	 * Inserts a block into the specified grid column using the Quick Inserter.
	 *
	 * You must call @see {@link setupColumns} before inserting an inner block using this method.
	 *
	 * @param { typeof GutenbergBlockComponent } blockClass A block class that responds to blockTitle and blockName
	 * @param { number } column number to insert it into, from left to right, starts with 1 (to make it more natural based on the
	 * input for the `setupColumns` method).
	 * @returns { GutenbergBlockComponent } instance of the added block
	 **/
	async insertBlock( blockClass, column ) {
		await this.addBlockButtons[ column - 1 ].click();

		const inserterSearchInputSelector = By.css( 'input.block-editor-inserter__search-input' );

		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( 'div.block-editor-inserter__quick-inserter.has-search.has-expand' ),
			3000
		);

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
			`div[id="${ this.blockID }"] div.wp-block-jetpack-layout-grid .block-editor-block-list__block[aria-label='Block: ${ blockClass.blockTitle }']`
		);
		const blockId = await this.driver.findElement( insertedBlockSelector ).getAttribute( 'id' );

		// We need to move focus away from the layout grid, or any subsequent blocks inserted will be part of it
		const blockAppenderWrapperSelector = await this.driver.findElement(
			By.css( '.interface-interface-skeleton__content' )
		);

		const blockAppenderWrapperBox = await this.driver.executeScript(
			'return arguments[0].getBoundingClientRect()',
			blockAppenderWrapperSelector
		);

		const actions = await this.driver.actions( { bridge: true } );

		await actions
			.move( {
				x: Math.trunc( blockAppenderWrapperBox.x + blockAppenderWrapperBox.width / 2 ),
				y: Math.trunc( blockAppenderWrapperBox.bottom - 50 ),
			} )
			.click()
			.perform();

		return blockClass.Expect( this.driver, blockId );
	}
}

export { LayoutGridBlockComponent };
