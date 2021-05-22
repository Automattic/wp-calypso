/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminLogonPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		let wpAdminURL = null;
		if ( url ) {
			url = url.replace( /^https?:\/\//, '' ).replace( /\/wp-admin/, '' );
			wpAdminURL = `http://${ url }/wp-admin`;
		}
		super( driver, By.css( '.login' ), wpAdminURL );
	}

	async logonSSO() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.jetpack-sso.button' ) );
	}

	async login( username, password ) {
		const ssoButton = By.css( '.jetpack-sso.button' );
		const userNameLocator = By.css( '#user_login' );
		const passwordLocator = By.css( '#user_pass' );
		const submitLocator = By.css( '#wp-submit' );

		if ( await driverHelper.isElementEventuallyLocatedAndVisible( this.driver, ssoButton, 2000 ) ) {
			await this.toggleSSOLogin();
		}
		await driverHelper.setWhenSettable( this.driver, userNameLocator, username );
		await driverHelper.setWhenSettable( this.driver, passwordLocator, password, {
			secureValue: true,
		} );
		await driverHelper.clickWhenClickable( this.driver, submitLocator );

		return await driverHelper.waitUntilElementNotLocated( this.driver, userNameLocator );
	}

	async toggleSSOLogin() {
		const ssoToggleButton = By.css( '.jetpack-sso-toggle' );
		return await driverHelper.clickWhenClickable( this.driver, ssoToggleButton );
	}
}
