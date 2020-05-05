/**
 * External dependencies
 */
import { By, Key } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';
import * as SlackNotifier from '../slack-notifier';
import * as driverManager from '../driver-manager';

// This is the Calypso WordPress.com login page
// For the wp-admin login page see /wp-admin/wp-admin-logon-page
export default class LoginPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wp-login__container' ), LoginPage.getLoginURL() );
	}

	async login( username, password, emailSSO = false, { retry = true } = {} ) {
		const driver = this.driver;
		const userNameSelector = By.css( '#usernameOrEmail' );
		const passwordSelector = By.css( '#password' );
		const changeAccountSelector = By.css( '#loginAsAnotherUser' );
		const alreadyLoggedInSelector = By.css( '.continue-as-user' );

		const isDisplayed = await driverHelper.isEventuallyPresentAndDisplayed(
			driver,
			alreadyLoggedInSelector,
			2000
		);
		if ( isDisplayed ) {
			await driverHelper.clickWhenClickable( driver, changeAccountSelector );
		}
		await driverHelper.waitTillPresentAndDisplayed( driver, userNameSelector );
		await driverHelper.setWhenSettable( driver, userNameSelector, username );
		await this.driver.sleep( 1000 );
		await driver.findElement( userNameSelector ).sendKeys( Key.ENTER );

		if ( emailSSO === false ) {
			await driverHelper.waitTillPresentAndDisplayed( driver, passwordSelector );
			await driverHelper.waitTillFocused( driver, passwordSelector );
			await driverHelper.setWhenSettable( driver, passwordSelector, password, {
				secureValue: true,
			} );

			await this.driver.sleep( 1000 );
			await driver.findElement( passwordSelector ).sendKeys( Key.ENTER );
		}

		await this.driver.sleep( 1000 );

		if ( retry === true ) {
			try {
				await driverHelper.waitTillNotPresent( driver, userNameSelector, this.explicitWaitMS * 2 );
			} catch ( e ) {
				await SlackNotifier.warn( `The login didn't work as expected - retrying now: '${ e }'`, {
					suppressDuplicateMessages: true,
				} );
				await driverManager.ensureNotLoggedIn( this.driver );
				return await this.login( username, password, { retry: false } );
			}
		}
		return await driverHelper.waitTillNotPresent( driver, userNameSelector );
	}

	use2FAMethod( twoFAMethod ) {
		let actionSelector;

		if ( twoFAMethod === 'sms' ) {
			actionSelector = By.css( 'button[data-e2e-link="2fa-sms-link"]' );
		} else if ( twoFAMethod === 'otp' ) {
			actionSelector = By.css( 'button[data-e2e-link="2fa-otp-link"]' );
		} else if ( twoFAMethod === 'backup' ) {
			actionSelector = By.css( 'button[data-e2e-link="lost-phone-link"]' );
		}

		if ( actionSelector ) {
			return driverHelper
				.isElementPresent( this.driver, actionSelector )
				.then( ( actionAvailable ) => {
					if ( actionAvailable ) {
						return driverHelper.clickWhenClickable( this.driver, actionSelector );
					}
				} );
		}
	}

	async enter2FACode( twoFACode ) {
		const twoStepCodeSelector = By.css( 'input[name="twoStepCode"]' );
		const submitSelector = By.css( '#wp-submit, button[type="submit"]' );

		await driverHelper.setWhenSettable( this.driver, twoStepCodeSelector, twoFACode );
		await driverHelper.clickWhenClickable( this.driver, submitSelector );

		return await driverHelper.waitTillNotPresent( this.driver, twoStepCodeSelector );
	}

	async requestMagicLink( emailAddress ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a[data-e2e-link="magic-login-link"]' )
		);
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.magic-login__email-fields input[name="usernameOrEmail"]' ),
			emailAddress,
			{ pauseBetweenKeysMS: 5 }
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.magic-login__form-action button.is-primary' )
		);
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.magic-login__check-email-image' )
		);
	}

	static getLoginURL() {
		return dataHelper.getCalypsoURL( 'log-in' );
	}
}
