/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper';

export default class JetpackAuthorizePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.is-section-jetpack-connect' ) );
	}

	async chooseSignIn() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.logged-out-form__link-item' )
		);
	}

	async approveConnection() {
		const authorizeButtonLocator = by.css( '.jetpack-connect__authorize-form button' );
		await driverHelper.clickWhenClickable( this.driver, authorizeButtonLocator );
		return await this.waitToDisappear();
	}

	async approveSSOConnection() {
		const SSOAprroveLocator = by.css( '.jetpack-connect__sso-actions button' );
		const loadingLocator = by.css( '.site.is-loading' );
		await driverHelper.waitUntilElementNotLocated( this.driver, loadingLocator );
		return await driverHelper.clickWhenClickable( this.driver, SSOAprroveLocator );
	}

	async waitToDisappear() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			by.css( '.jetpack-connect__logged-in-form-loading' ),
			this.explicitWaitMS * 2
		);
	}
}
