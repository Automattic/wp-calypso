/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class JetpackConnectSiteTopicPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-connect__step .site-topic__content' ) );
	}

	async selectSiteTopic( siteTopic ) {
		const siteTopicInputSelector = By.css( '.suggestion-search input' );
		const siteTopicButtonSelector = By.css( '.site-topic__content button[type="submit"]' );
		const siteTopicSpinnerSelector = By.css( '.suggestion-search .spinner' );

		await driverHelper.setWhenSettable( this.driver, siteTopicInputSelector, siteTopic );
		await driverHelper.waitTillNotPresent( this.driver, siteTopicSpinnerSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, siteTopicButtonSelector );
		return await driverHelper.clickWhenClickable( this.driver, siteTopicButtonSelector );
	}
}
