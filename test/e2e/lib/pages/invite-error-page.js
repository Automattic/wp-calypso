/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';

export default class InviteErrorPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.empty-content__illustration' ) );
	}

	async inviteErrorTitleDisplayed() {
		return await driverHelper.isElementLocated( this.driver, By.css( '.empty-content__title' ) );
	}
}
