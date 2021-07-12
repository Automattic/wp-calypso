import config from 'config';
import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class PressableSiteSettingsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-show-sections' ) );
	}

	async waitForJetpackPremium() {
		const loadingLocator = By.css( '.activating img.loading-image' );
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			loadingLocator,
			explicitWaitMS * 4
		);
	}

	async activateJetpackPremium() {
		const activationLink = By.css( '.jetpack-activation-notice a[href*="/jetpack_partnership"]' );
		await this.driver.sleep( 1000 ); // Button isn't clickable right away
		return await driverHelper.clickWhenClickable( this.driver, activationLink );
	}

	async deleteSite() {
		const deleteButton = By.css( '.delete-destroy a' );
		const confirmButton = By.css( '.modal .confirm' );

		const deleteButtonElement = await this.driver.findElement( deleteButton );
		await this.driver.executeScript( 'arguments[0].scrollIntoView()', deleteButtonElement );
		await driverHelper.clickWhenClickable( this.driver, deleteButton );
		return await driverHelper.clickWhenClickable( this.driver, confirmButton );
	}
}
