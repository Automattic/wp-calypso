/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

export default class RevisionsModalComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.editor-revisions' ) );
	}

	async _preInit() {
		return await this.driver.switchTo().defaultContent();
	}

	async loadFirstRevision() {
		const firstRevision = await this.driver.findElement(
			By.css( '.editor-revisions-list__revision:last-child .editor-revisions-list__button' )
		);
		const loadButton = await this.driver.findElement( By.css( '[data-e2e-button="load"]' ) );

		// Using a JS clicks here since Webdriver clicks weren't working.
		await this.driver.executeScript( 'arguments[0].click()', firstRevision );
		await this.driver.executeScript( 'arguments[0].click()', loadButton );

		return driverHelper.waitTillNotPresent( this.driver, this.expectedElementSelector );
	}
}
