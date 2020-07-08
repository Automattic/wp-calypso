/**
 * External dependencies
 */
import { By, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminInPlaceApprovePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jp-jetpack-connect__iframe' ) );
	}

	async approve() {
		const approveButtonSelector = By.css( '#approve' );
		await this.driver.wait(
			until.ableToSwitchToFrame( this.expectedElementSelector ),
			this.explicitWaitMS,
			'Could not locate the payment button iFrame.'
		);
		await driverHelper.waitTillPresentAndDisplayed( this.driver, approveButtonSelector );
		await driverHelper.clickWhenClickable( this.driver, approveButtonSelector );
		return await this.driver.switchTo().defaultContent();
	}
}
