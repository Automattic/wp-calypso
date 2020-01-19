/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class JetpackConnectPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.jetpack-connect__main' ), url );
	}

	async addSiteUrl( url ) {
		const urlInputSelector = By.css( '.jetpack-connect__site-address-container #siteUrl' );
		const confirmButtonSelector = By.css(
			'.jetpack-connect__main .jetpack-connect__connect-button:not([disabled])'
		);

		await driverHelper.setWhenSettable( this.driver, urlInputSelector, url );
		return await driverHelper.clickWhenClickable( this.driver, confirmButtonSelector );
	}

	async waitToDisappear() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.jetpack-connect__main #siteUrl' ),
			this.explicitWaitMS * 3
		);
	}
}
