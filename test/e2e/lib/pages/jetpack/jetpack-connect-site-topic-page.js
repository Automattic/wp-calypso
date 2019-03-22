/** @format */
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class JetpackConnectSiteTopicPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-connect__step .site-topic__content' ) );
	}

	async selectSiteTopic( siteTopic ) {
		const siteTopicInputSelector = By.css( '.suggestion-search input' );
		const siteTopicButtonSelector = By.css( '.site-topic__content button:not(disabled)' );

		await driverHelper.setWhenSettable( this.driver, siteTopicInputSelector, siteTopic );
		await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.site-topic__content button[disabled]' )
		);
		return await driverHelper.clickWhenClickable( this.driver, siteTopicButtonSelector );
	}
}
