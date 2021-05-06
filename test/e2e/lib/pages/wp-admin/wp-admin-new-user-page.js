/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminNewUserPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'h1#add-new-user' ) );
	}

	async addUser( username, email = username ) {
		const usernameInputLocator = By.css( '#user_login' );
		const emailInputLocator = By.css( '#email' );
		const passwordButtonLocator = By.css( '.wp-generate-pw' );
		const passwordInputLocator = By.css( '#pass1' );
		const buttonLocator = By.css( '#createusersub' );
		const subscriberRoleSelect = By.css( "#role [value='subscriber']" );
		const successNoticeLocator = By.css( '#message.updated a[href*="user-edit"]' );

		await driverHelper.setWhenSettable( this.driver, usernameInputLocator, username );
		await driverHelper.setWhenSettable( this.driver, emailInputLocator, email );
		await driverHelper.clickWhenClickable( this.driver, passwordButtonLocator );
		await driverHelper.setWhenSettable( this.driver, passwordInputLocator, email );

		driverHelper.clickWhenClickable( this.driver, subscriberRoleSelect );

		await driverHelper.clickWhenClickable( this.driver, buttonLocator );
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			successNoticeLocator
		);
	}

	static async refreshIfJNError( driver ) {
		return await driverHelper.refreshIfJNError( driver );
	}
}
