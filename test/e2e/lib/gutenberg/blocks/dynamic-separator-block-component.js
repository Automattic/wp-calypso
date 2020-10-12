/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class DynamicSeparatorBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Dynamic HR';
	static blockName = 'coblocks/dynamic-separator';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-coblocks-dynamic-separator' );

	/**
	 * Expands the horizontal ruler by the amount of pixels specified. This is useful
	 * to test the functionality of the Dynamic HR in the editor and later in the
	 * frontend too.
	 *
	 * @param {number} pixels the amount of pixerls to expand the HR ruler by, horizontally.
	 */
	async resizeBy( pixels ) {
		// We need to move focus away from the layout grid, or any subsequent blocks inserted will be part of it
		const resizeHandleSelector = await this.driver.findElement(
			By.css(
				`div[id='${ this.blockID.slice(
					1
				) }'] div.components-resizable-box__handle.components-resizable-box__side-handle.components-resizable-box__handle-bottom`
			)
		);

		const bbox = await this.driver.executeScript(
			'return arguments[0].getBoundingClientRect()',
			resizeHandleSelector
		);

		const actions = await this.driver.actions( { bridge: true } );

		// The move function only accepts integers and will fail on floats
		const resizeHandleX = Math.trunc( bbox.x + bbox.width / 2 );
		const resizeHandleY = Math.trunc( bbox.y + bbox.height / 2 );

		await actions
			.move( {
				x: resizeHandleX,
				y: resizeHandleY,
			} )
			.press()
			.move( {
				y: resizeHandleY + pixels,
			} )
			.release()
			.perform();
	}
}

export { DynamicSeparatorBlockComponent };
