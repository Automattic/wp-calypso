/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper';

export default class JetpackAuthorizePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-section-jetpack-connect' ) );
	}

	async chooseSignIn() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.logged-out-form__link-item' )
		);
	}

	async approveConnection() {
		const authorizeButtonLocator = By.css( '.jetpack-connect__authorize-form button' );
		await driverHelper.clickWhenClickable( this.driver, authorizeButtonLocator );
		return await this.waitToDisappear();
	}

	async approveSSOConnection() {
		const SSOAprroveLocator = By.css( '.jetpack-connect__sso-actions button' );
		const loadingLocator = By.css( '.site.is-loading' );
		await driverHelper.waitUntilElementNotLocated( this.driver, loadingLocator );
		return await driverHelper.clickWhenClickable( this.driver, SSOAprroveLocator );
	}

	async waitToDisappear() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.jetpack-connect__logged-in-form-loading' ),
			this.explicitWaitMS * 2
		);
	}
}
