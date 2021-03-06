import { By } from 'selenium-webdriver';
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
		const locator = By.css( '.theme__sheet-primary-button' );
		return await driverHelper.clickWhenClickable( this.driver, locator, this.explicitWaitMS );
	}
}
