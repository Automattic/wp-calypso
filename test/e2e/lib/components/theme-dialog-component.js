/** @format */

/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThemeDialogComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.themes__thanks-modal' ) );
	}

	async _postInit() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.themes__thanks-modal h1' ),
			this.explicitWaitMS * 2
		);
	}

	async goToThemeDetail() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog button[data-e2e-button="learn"]' )
		);
	}

	async customizeSite() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog button[data-e2e-button="customizeSite"]' )
		);
		return await driverHelper.switchToWindowByIndex( this.driver, 1 );
	}
}
