import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';

/**
 * Abstract class containing shared code for editor-related classes.
 */
export default class AbstractEditorComponent extends AsyncBaseContainer {
	/**
	 * Insert a child block into a parent block using the inline block inserter.
	 *
	 * @param {string} name the name of the block to insert as a child.
	 * @param {string} container the name of the container block to insert the child block into.
	 */
	async insertBlockOrPatternViaBlockAppender( name, container = 'Group' ) {
		const containerBlockId = await this.addBlock( container );
		await this.runInCanvas( async () => {
			const blockAppenderLocator = By.css(
				`#${ containerBlockId } .block-editor-button-block-appender`
			);
			await driverHelper.clickWhenClickable( this.driver, blockAppenderLocator );
		} );

		const quickInserterSearchInputLocator = By.css(
			`.block-editor-inserter__quick-inserter .components-search-control__input`
		);

		const patternItemLocator = By.css(
			'.block-editor-inserter__quick-inserter .block-editor-block-types-list__item, .block-editor-inserter__quick-inserter .block-editor-block-patterns-list__item'
		);

		await driverHelper.setWhenSettable( this.driver, quickInserterSearchInputLocator, name );
		await driverHelper.clickWhenClickable( this.driver, patternItemLocator );
	}

	async openBlockInserterAndSearch( searchTerm ) {
		await this.runInCanvas( async () => {
			await driverHelper.scrollIntoView(
				this.driver,
				By.css( '.block-editor-writing-flow' ),
				'start'
			);
		} );

		await this.openBlockInserter();
		const inserterSearchInputLocator = By.css( 'input.components-search-control__input' );
		await driverHelper.setWhenSettable( this.driver, inserterSearchInputLocator, searchTerm );
	}

	/**
	 * Set the running context for operating on the DOM, i.e switch to the right
	 * iframe. By default, it's defined here as a noop, but can be overriden in
	 * subclasses with a proper implementation, if needed.
	 *
	 * @param {Function} cb  The callback setting the right document context.
	 * @returns {*} depends on the return value of the cb function.
	 */
	async runInCanvas( cb ) {
		return await cb();
	}
}
