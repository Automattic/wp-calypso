/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';

export default class RevokePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.people-invite-details__clear-revoke' ) );
	}

	async revokeUser() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.people-invite-details__clear-revoke [type]' )
		);
	}
}
