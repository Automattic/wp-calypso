/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class SignupPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup-form__body' ) );
	}

	async enterEmail( email ) {
		const emailLocator = By.css( '.signup-form__body input[type="email"]' );
		return await driverHelper.setWhenSettable( this.driver, emailLocator, email );
	}

	async enterPassword( password ) {
		const passwordLocator = By.css( '.signup-form__body input[type="password"]' );
		return await driverHelper.setWhenSettable( this.driver, passwordLocator, password );
	}

	async createAccount() {
		const submitButtonLocator = By.css( '.signup-form__body button[type="submit"]' );
		return await driverHelper.clickWhenClickable( this.driver, submitButtonLocator );
	}
}
