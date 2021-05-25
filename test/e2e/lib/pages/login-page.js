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

	async login( username, password, emailSSO = false, { retry = true, isPopup = false } = {} ) {
		const driver = this.driver;
		const userNameLocator = By.css( '#usernameOrEmail' );
		const passwordLocator = By.css( '#password' );
		const changeAccountLocator = By.css( '#loginAsAnotherUser' );
		const alreadyLoggedInLocator = By.css( '.continue-as-user' );

		const isDisplayed = await driverHelper.isElementEventuallyLocatedAndVisible(
			driver,
			alreadyLoggedInLocator,
			2000
		);
		if ( isDisplayed ) {
			await driverHelper.clickWhenClickable( driver, changeAccountLocator );
		}
		await driverHelper.setWhenSettable( driver, userNameLocator, username );
		await this.driver.sleep( 1000 );
		await driver.findElement( userNameLocator ).sendKeys( Key.ENTER );

		if ( emailSSO === false ) {
			await driverHelper.setWhenSettable( driver, passwordLocator, password, {
				secureValue: true,
			} );

			await this.driver.sleep( 1000 );
			await driver.findElement( passwordLocator ).sendKeys( Key.ENTER );
		}

		if ( isPopup ) {
			return;
		}

		await this.driver.sleep( 1000 );

		if ( retry === true ) {
			try {
				await driverHelper.waitUntilElementNotLocated(
					driver,
					userNameLocator,
					this.explicitWaitMS * 2
				);
			} catch ( e ) {
				await SlackNotifier.warn( `The login didn't work as expected - retrying now: '${ e }'`, {
					suppressDuplicateMessages: true,
				} );
				await driverManager.ensureNotLoggedIn( this.driver );
				return await this.login( username, password, { retry: false } );
			}
		}
		await driverHelper.waitUntilElementNotLocated( driver, userNameLocator );
	}

	async use2FAMethod( twoFAMethod ) {
		let actionLocator;

		if ( twoFAMethod === 'sms' ) {
			actionLocator = By.css( 'button[data-e2e-link="2fa-sms-link"]' );
		} else if ( twoFAMethod === 'otp' ) {
			actionLocator = By.css( 'button[data-e2e-link="2fa-otp-link"]' );
		} else if ( twoFAMethod === 'backup' ) {
			actionLocator = By.css( 'button[data-e2e-link="lost-phone-link"]' );
		}

		if ( actionLocator ) {
			return await driverHelper.clickIfPresent( this.driver, actionLocator );
		}
	}

	async enter2FACode( twoFACode ) {
		const twoStepCodeLocator = By.css( 'input[name="twoStepCode"]' );
		const submitLocator = By.css( '#wp-submit, button[type="submit"]' );

		await driverHelper.setWhenSettable( this.driver, twoStepCodeLocator, twoFACode );
		await driverHelper.clickWhenClickable( this.driver, submitLocator );

		return await driverHelper.waitUntilElementNotLocated( this.driver, twoStepCodeLocator );
	}

	async requestMagicLink( emailAddress ) {
		/**
		 * Wait for the form to become enabled so the magic link is clickable.
		 *
		 * @see {@link https://github.com/Automattic/wp-calypso/pull/50999}
		 */
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.login__form-action button:not(:disabled)' )
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '[data-e2e-link="magic-login-link"]' )
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
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.magic-login__check-email-image' )
		);
	}

	static getLoginURL() {
		return dataHelper.getCalypsoURL( 'log-in' );
	}
}
