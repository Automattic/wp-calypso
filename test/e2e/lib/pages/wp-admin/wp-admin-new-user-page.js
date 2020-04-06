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
		const usernameInputSelector = By.css( '#user_login' );
		const emailInputSelector = By.css( '#email' );
		const passwordButtonSelector = By.css( '.wp-generate-pw' );
		const passwordInputSelector = By.css( '#pass1' );
		const buttonSelector = By.css( '#createusersub' );
		const subscriberRoleSelect = By.css( "#role [value='subscriber']" );
		const successNoticeSelector = By.css( '#message.updated a[href*="user-edit"]' );

		await driverHelper.setWhenSettable( this.driver, usernameInputSelector, username );
		await driverHelper.setWhenSettable( this.driver, emailInputSelector, email );
		await driverHelper.clickWhenClickable( this.driver, passwordButtonSelector );
		await driverHelper.setWhenSettable( this.driver, passwordInputSelector, email );

		driverHelper.clickWhenClickable( this.driver, subscriberRoleSelect );

		await driverHelper.clickWhenClickable( this.driver, buttonSelector );
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, successNoticeSelector );
	}

	static async refreshIfJNError( driver ) {
		return await driverHelper.refreshIfJNError( driver );
	}
}
