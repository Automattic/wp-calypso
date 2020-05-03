/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import WPAdminLogonPage from '../pages/wp-admin/wp-admin-logon-page';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class PressableNUXFlow {
	constructor( driver ) {
		this.driver = driver;
	}

	async addSiteCredentials() {
		const shareCredentialsSelector = By.css( '.creds-permission__card button' );
		const continueSelector = By.css( 'a.creds-complete__button' );
		const successNoticeSelector = By.css( '#notices .is-success .gridicons-checkmark' );

		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			shareCredentialsSelector,
			explicitWaitMS * 2
		);
		await driverHelper.clickWhenClickable( this.driver, shareCredentialsSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, successNoticeSelector );
		await driverHelper.clickWhenClickable( this.driver, continueSelector );
		const loginPage = await WPAdminLogonPage.Expect( this.driver );
		return await loginPage.logonSSO();
	}
}
