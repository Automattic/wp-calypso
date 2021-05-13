/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class MagicLoginPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.magic-login__handle-link' ) );
	}

	async finishLogin() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.magic-login__handle-link button.is-primary' )
		);
	}
}
