/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class ThemeDetailPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.theme__sheet.main' ) );
	}

	async openLiveDemo() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.theme__sheet-screenshot' )
		);
	}

	async goBackToAllThemes() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.button.header-cake__back' )
		);
	}

	async pickThisDesign() {
		const selector = By.css( '.theme__sheet-primary-button' );
		return await driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
}
