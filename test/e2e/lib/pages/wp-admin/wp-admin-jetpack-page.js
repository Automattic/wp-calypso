/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminJetpackPage extends AsyncBaseContainer {
	constructor( driver ) {
		const ADMIN_PAGE_WAIT_MS = 25000;
		super( driver, By.css( '#jp-plugin-container' ), null, ADMIN_PAGE_WAIT_MS );
	}

	async connectWordPressCom() {
		const locator = By.css( ".jp-connect-full__button-container a[href*='register']" );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
		await this.driver.sleep( 1000 );
		return await driverHelper.clickWhenClickable( this.driver, locator );
	}

	async inPlaceConnect() {
		const locator = By.css( ".jp-connect-full__button-container a[href*='register']" );
		const spinnerLocator = By.css(
			'.jp-connect-full__button-container:not([style="display: none;"]) .jp-spinner'
		);
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
		await this.driver.sleep( 1000 );
		await driverHelper.clickWhenClickable( this.driver, locator );

		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, spinnerLocator );

		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			spinnerLocator,
			this.explicitWaitMS * 3
		);
	}

	async atAGlanceDisplayed() {
		return await driverHelper.isElementLocated( this.driver, By.css( '.jp-at-a-glance' ) );
	}

	async openPlansTab() {
		const locator = By.css( '.dops-section-nav__panel li.dops-section-nav-tab:nth-child(2) a' );
		return await driverHelper.clickWhenClickable( this.driver, locator );
	}

	async clickUpgradeNudge() {
		const locator = By.css( '.dops-banner a[href*="aag-search"]' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, locator );
		return await driverHelper.clickWhenClickable( this.driver, locator );
	}

	async disconnectSite() {
		const manageConnectionButton = By.css( '.jp-connection-settings__actions a' );
		const disconnectButton = By.css(
			'.jp-connection-settings__modal-actions .dops-button.is-scary'
		);
		const successDisconnectNotice = By.css( ".dops-notice a[href*='disconnected']" );
		await driverHelper.clickWhenClickable( this.driver, manageConnectionButton );
		await driverHelper.clickWhenClickable( this.driver, disconnectButton );

		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			successDisconnectNotice,
			this.explicitWaitMS * 2
		);
	}
}
