/** @format */
import { By } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class JetpackConnectAddCredentialsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super(
			driver,
			By.css( '.is-section-jetpack-connect .jetpack-connect__site-url-input-container' )
		);
	}

	async enterDetailsAndConnect( username, password ) {
		await driverHelper.setWhenSettable( this.driver, By.css( '#username' ), username );
		await driverHelper.setWhenSettable( this.driver, By.css( '#password' ), password, {
			secureValue: true,
		} );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.jetpack-connect__credentials-submit' )
		);
	}
}
