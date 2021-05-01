/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export default class PullquoteBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Pullquote';

	async setTextInFauxTextbox( text, textboxLocator ) {
		await driverHelper.waitUntilLocatedAndVisible( this.driver, textboxLocator );
		// These aren't real textboxes, so driverHelpers.setWhenSettable will NOT work
		// So we have to get the element and send the keys directly
		const fauxTextboxElement = await this.driver.findElement( textboxLocator );
		await fauxTextboxElement.sendKeys( text );
	}

	async setQuote( quoteText ) {
		const quoteLocator = By.css( `${ this.blockID } [aria-label='Pullquote text']` );
		await this.setTextInFauxTextbox( quoteText, quoteLocator );
	}

	async setCitation( citationText ) {
		const citationLocator = By.css( `${ this.blockID } [aria-label='Pullquote citation text']` );
		await this.setTextInFauxTextbox( citationText, citationLocator );
	}
}
