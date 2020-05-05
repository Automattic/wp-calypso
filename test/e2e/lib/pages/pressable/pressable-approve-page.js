/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';

export default class PressableApprovePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'form#authorize img[alt="MyPressable"]' ) );
	}

	async approve() {
		const approveButtonSelector = By.css( '#approve' );
		return await driverHelper.clickWhenClickable( this.driver, approveButtonSelector );
	}
}
