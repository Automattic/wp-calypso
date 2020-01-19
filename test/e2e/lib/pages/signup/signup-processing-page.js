/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

import * as SlackNotifier from '../../slack-notifier';
import * as driverHelper from '../../driver-helper';
import LoginPage from '../../pages/login-page';

export default class SignupProcessingPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup-processing-screen__content' ) );
	}

	async waitForPage() {
		try {
			await driverHelper.isEventuallyPresentAndDisplayed(
				this.driver,
				this.expectedElementSelector,
				this.explicitWaitMS
			);
		} catch {
			console.log( 'Signup Processing Page was not displayed or moved too quickly for the test' );
		}
	}

	async waitToDisappear( username, password ) {
		const signupProcessingTimeout = this.explicitWaitMS * 7.5; // Wait 150s for signup processing
		try {
			await driverHelper.waitTillNotPresent(
				this.driver,
				this.expectedElementSelector,
				signupProcessingTimeout
			);
		} catch ( e ) {
			throw new Error(
				'Looks like creating account is taking to long( ' +
					signupProcessingTimeout +
					'ms ). Please try again in a while.'
			);
		}
		const url = await this.driver.getCurrentUrl();
		if ( url.indexOf( 'log-in' ) > -1 ) {
			SlackNotifier.warn(
				'Sign up was redirected to log-in page - logging in with new account :('
			);
			const loginPage = await LoginPage.Expect( this.driver );
			await loginPage.login( username, password, { retry: false } );
		}
	}

	static async hideFloatiesinIE11( driver ) {
		const floatiesStringSelector = '.signup-processing-screen__floaties';

		// Hides the floating background on signup that causes issues with Selenium/SauceLabs getting page loaded status
		if ( global.browserName === 'Internet Explorer' ) {
			await driver.executeScript(
				'document.querySelector( "' + floatiesStringSelector + '" ).style.display = "none";'
			);
		}
	}
}
