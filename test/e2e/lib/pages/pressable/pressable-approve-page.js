import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class PressableApprovePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'form#authorize img[alt="MyPressable"]' ) );
	}

	async approve() {
		const approveButtonLocator = By.css( '#approve' );
		return await driverHelper.clickWhenClickable( this.driver, approveButtonLocator );
	}
}
