/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

/**
 * POM class to represent a Cover block. Contains methods unique to the Cover block. For other shared
 * media actions, see shared-block-flows/media-block-flows.js
 */
export default class CoverBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Cover';

	/**
	 * Sets the provided text to the Cover title Paragraph block. Appends the text to whatever is already there.
	 *
	 * @param {string} text Text to type in the Cover title Paragraph block.
	 */
	async setTitleText( text ) {
		const paragraphLocator = By.css( `${ this.blockID } p.block-editor-rich-text__editable` );
		const paragraphElement = await this.driver.findElement( paragraphLocator );
		await paragraphElement.sendKeys( text );
	}

	/**
	 * Gets the src value for the image being used currently as the Cover background.
	 *
	 * @returns {string | null} The value of the src string on the background img element, or null if src is unset
	 */
	async getImageSrc() {
		const imgElement = await this.driver.findElement(
			By.css( `${ this.blockID } img.wp-block-cover__image-background` )
		);
		return await imgElement.getAttribute( 'src' );
	}

	/**
	 * In the starting Cover state, pick a background color the nth position of the color swatch button.
	 * E.g., if you wanted to pick the second color, pass 2 for the nthPosition value.
	 *
	 * @param {number} nthPosition The nth position (index starting at 1) for the color to select.
	 */
	async selectInitialBackgroundColorByNthPosition( nthPosition ) {
		const buttonLocator = By.css(
			`${ this.blockID } .components-circular-option-picker__option-wrapper:nth-child(${ nthPosition }) button`
		);
		await driverHelper.clickWhenClickable( this.driver, buttonLocator );
	}

	/**
	 * Focus the parent Cover block by clicking on its background.
	 *
	 * Focusing the parent block is surprisingly hard on a Cover because there's always some kind of text
	 * in the middle of the block which will take focus when clicked. We can't use keyboard navigation because it
	 * doesn't cause the block toolbar to appear. This method focuses the parent Cover by clicking on the background
	 * between the middle and bottom of the block to avoid the middle text and any open toolbars.
	 */
	async focusBlock() {
		const coverElement = await this.driver.findElement( this.expectedElementSelector );
		const coverHeight = ( await coverElement.getRect() ).height;
		// we're splitting the difference between the middle of the cover and the bottom
		// we can move this even more aggressively toward 0.50 in the future if needed
		const verticalOffsetBelowCenter = -parseInt( coverHeight * 0.25 );
		const actions = this.driver.actions();
		await actions
			.move( { origin: coverElement, y: verticalOffsetBelowCenter } )
			.press()
			.release()
			.perform();

		// make sure it actually gets focus
		await driverHelper.waitUntilLocatedAndVisible(
			this.driver,
			By.css( `${ this.blockID }.block-editor-block-list__block.is-selected` )
		);
	}
}
