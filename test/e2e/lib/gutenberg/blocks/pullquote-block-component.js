/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

/**
 * POM class to represent a Pullquote block.
 */
export default class PullquoteBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Pullquote';

	_quoteLocator() {
		return By.css( `${ this.blockID } [aria-label='Pullquote text']` );
	}

	_citationLocator() {
		return By.css( `${ this.blockID } [aria-label='Pullquote citation text']` );
	}

	async _setTextInFakeTextbox( text, textboxLocator ) {
		// These aren't real textboxes, so driverHelpers.setWhenSettable will NOT work
		// So we have to get the element and send the keys directly
		const fauxTextboxElement = await this.driver.findElement( textboxLocator );
		await fauxTextboxElement.sendKeys( text );
	}

	/**
	 * Set the text in the quote part of the Pullquote. Does not clear existing text.
	 *
	 * @param {string} quoteText Text to add
	 */
	async setQuote( quoteText ) {
		await this._setTextInFakeTextbox( quoteText, this._quoteLocator() );
	}

	/**
	 * Set the text in the citation part of the Pullquote. Does not clear existing text.
	 *
	 * @param {string} citationText Text to add
	 */
	async setCitation( citationText ) {
		await this._setTextInFakeTextbox( citationText, this._citationLocator() );
	}

	/**
	 * Gets the text currently set in the quote part of the Pullquote.
	 *
	 * @returns {string} The current quote text
	 */
	async getQuoteText() {
		const quoteWrapperElement = await this.driver.findElement( this._quoteLocator() );
		return await quoteWrapperElement.getText();
	}

	/**
	 * Gets the text currently set in the citation part of the Pullquote.
	 *
	 * @returns {string} The current citation text
	 */
	async getCitationText() {
		const quoteWrapperElement = await this.driver.findElement( this._citationLocator() );
		return await quoteWrapperElement.getText();
	}
}
