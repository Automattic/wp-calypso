/**
 * External dependencies
 */
import config from 'config';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class PressableSiteSettingsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-show-sections' ) );
	}

	waitForJetpackPremium() {
		const loadingSelector = By.css( '.activating img.loading-image' );
		return driverHelper.waitTillNotPresent( this.driver, loadingSelector, explicitWaitMS * 4 );
	}

	gotoWPAdmin() {
		const buttonSelector = By.css( '.site-show-bar-wp-btn' );
		return driverHelper.followLinkWhenFollowable( this.driver, buttonSelector );
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
