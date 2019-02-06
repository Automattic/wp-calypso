/** @format */
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class JetpackConnectPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.jetpack-connect__main' ), url );
	}

	async addSiteUrl( url ) {
		let urlInputSelector = By.css( '.jetpack-connect__site-address-container #siteUrl' );
		let confirmButtonSelector = By.css(
			'.jetpack-connect__main .jetpack-connect__connect-button:not([disabled])'
		);

		await driverHelper.setWhenSettable( this.driver, urlInputSelector, url );
		return await driverHelper.clickWhenClickable( this.driver, confirmButtonSelector );
	}
}
