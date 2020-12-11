/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';
import AsyncBaseContainer from '../../async-base-container';

export default class SignupPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup-form' ) );
	}

	async enterEmail( email ) {
		const emailInputSelector = By.css( 'input[type="email"]' );
		return await driverHelper.setWhenSettable( this.driver, emailInputSelector, email );
	}

	async enterPassword( password ) {
		const passwordInputSelector = By.css( 'input[type="password"]' );
		return await driverHelper.setWhenSettable( this.driver, passwordInputSelector, password );
	}

	async createAccount() {
		const createAccountButtonSelector = By.css( 'button[type="submit"]' );
		return await driverHelper.clickWhenClickable( this.driver, createAccountButtonSelector );
	}
}
