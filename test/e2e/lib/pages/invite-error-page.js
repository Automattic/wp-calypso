/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as DriverHelper from '../driver-helper.js';

export default class InviteErrorPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.empty-content__illustration' ) );
	}

	inviteErrorTitleDisplayed() {
		return DriverHelper.isElementPresent( this.driver, By.css( '.empty-content__title' ) );
	}
}
