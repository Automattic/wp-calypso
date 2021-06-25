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
		const shareCredentialsLocator = By.css( '.creds-permission__card button' );
		const continueLocator = By.css( 'a.creds-complete__button' );
		const successNoticeLocator = By.css( '#notices .is-success .gridicons-checkmark' );

		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			shareCredentialsLocator,
			explicitWaitMS * 2
		);
		await driverHelper.clickWhenClickable( this.driver, shareCredentialsLocator );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, successNoticeLocator );
		await driverHelper.clickWhenClickable( this.driver, continueLocator );
		const loginPage = await WPAdminLogonPage.Expect( this.driver );
		return await loginPage.logonSSO();
	}
}
