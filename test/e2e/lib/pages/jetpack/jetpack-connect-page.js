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
		super( driver, By.css( '.is-section-jetpack-connect' ), url );
	}

	async addSiteUrl( url ) {
		const urlInputLocator = By.css( '.jetpack-connect__site-address-container #siteUrl' );
		const confirmButtonLocator = By.css(
			'.jetpack-connect__main .jetpack-connect__connect-button:not([disabled])'
		);

		await driverHelper.setWhenSettable( this.driver, urlInputLocator, url );
		await driverHelper.clickWhenClickable( this.driver, confirmButtonLocator );
		return await this.waitToDisappear();
	}

	async waitToDisappear() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.jetpack-connect__main #siteUrl' ),
			this.explicitWaitMS * 3
		);
	}
}
