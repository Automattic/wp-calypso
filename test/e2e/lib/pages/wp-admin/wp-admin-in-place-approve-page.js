import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class WPAdminInPlaceApprovePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jp-jetpack-connect__iframe' ) );
	}

	async approve() {
		const approveButtonLocator = By.css( '#approve' );
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, this.expectedElementLocator );
		await driverHelper.clickWhenClickable( this.driver, approveButtonLocator );
		await this.driver.switchTo().defaultContent();
	}
}
