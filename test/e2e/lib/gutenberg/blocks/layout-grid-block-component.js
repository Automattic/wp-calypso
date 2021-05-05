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
	static blockFrontendLocator = By.css( '.entry-content .wp-block-jetpack-layout-grid' );

	/**
	 * Sets up the number of columns for the layout grid block.
	 *
	 * @param {number} number number of columns, 1 to 4 (based on the default buttons in the block).
	 */
	async setupColumns( number ) {
		const columnButtonLocator = By.css(
			`${ this.blockID } button[aria-label="${ number } columns"]`
		);
		await driverHelper.clickWhenClickable( this.driver, columnButtonLocator );

		const updatedBlockID = await this.driver
			.findElement( By.css( 'div.block-editor-block-list__block.is-selected' ) )
			.getAttribute( 'id' );

		// Update the blockID, since the block is replaced by another one upon the selection of the columns.
		this.blockID = `#${ updatedBlockID }`;
		this.columns = number;
	}

	/**
	 * Inserts a block in the last available grid for the layout grid.
	 * This will add to each column in sequence, from left to right.
	 *
	 * @param { Function } blockClass A block class that responds to blockTitle and blockName
	 * @returns { GutenbergBlockComponent } instance of the added block
	 **/
	async insertBlock( blockClass ) {
		if ( ! this.columns ) {
			throw new Error( 'You need to run setupColumns before inserting an inner block.' );
		}

		const addBlockButtonLocator = By.css( `${ this.blockID } button[aria-label="Add block"]` );
		const addBlockButtons = await this.driver.findElements( addBlockButtonLocator );
		const firstEmptyColumnIndex = this.columns - addBlockButtons.length + 1;
		const blockLocator = By.css( this.blockID );
		const columnLocator = By.css(
			`${ this.blockID } div[data-type="jetpack/layout-grid-column"]:nth-child(${ firstEmptyColumnIndex })`
		);

		// We need to click through the layers until the appender is clickable:
		await driverHelper.clickWhenClickable( this.driver, blockLocator );
		await driverHelper.clickWhenClickable( this.driver, columnLocator );
		await driverHelper.clickWhenClickable( this.driver, addBlockButtonLocator );

		const inserterSearchInputLocator = By.css( 'input.block-editor-inserter__search-input' );

		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( 'div.block-editor-inserter__quick-inserter.has-search.has-expand' ),
			3000
		);

		await driverHelper.setWhenSettable(
			this.driver,
			inserterSearchInputLocator,
			blockClass.blockTitle
		);

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `button.editor-block-list-item-${ blockClass.blockName.replace( '/', '-' ) }` )
		);

		const insertedBlockLocator = By.css(
			`${ this.blockID } div[aria-label='Block: ${ blockClass.blockTitle }']`
		);

		const blockId = await this.driver.findElement( insertedBlockLocator ).getAttribute( 'id' );

		// We need to move focus away from the layout grid, or any subsequent blocks inserted will be part of it
		const blockAppenderWrapperLocator = await this.driver.findElement(
			By.css( '.interface-interface-skeleton__content' )
		);

		const blockAppenderWrapperBox = await this.driver.executeScript(
			'return arguments[0].getBoundingClientRect()',
			blockAppenderWrapperLocator
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
