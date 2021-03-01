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
		const emailSelector = By.css( '.signup-form__body input[type="email"]' );
		return await driverHelper.setWhenSettable( this.driver, emailSelector, email );
	}

	async enterPassword( password ) {
		const passwordSelector = By.css( '.signup-form__body input[type="password"]' );
		return await driverHelper.setWhenSettable( this.driver, passwordSelector, password );
	}

	async createAccount() {
		const submitButtonSelector = By.css( '.signup-form__body button[type="submit"]' );
		return await driverHelper.clickWhenClickable( this.driver, submitButtonSelector );
	}
}
