/**
 * External dependencies
 */
import assert from 'assert';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class MyHomePage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.customer-home__main' ), url );

		this.deprecatedCelebrateNoticeCloseButtonSelector = By.css(
			'.celebrate-notice .dismissible-card__close-icon'
		);
		this.celebrateNoticeCloseButtonSelector = By.css( '.celebrate-notice-v2__action' );

		this.siteSetupListSelector = By.css( '.customer-home__main .site-setup-list' );
		this.updateHomepageTaskSelector = By.css(
			'.customer-home__main [data-task="front_page_updated"]'
		);
		this.confirmEmailTaskSelector = By.css( '.customer-home__main [data-task="email_verified"]' );
		this.startTaskButtonSelector = By.css( '.customer-home__main .site-setup-list__task-action' );
		this.taskBadgeSelector = By.css( '.customer-home__main .site-setup-list__task-badge' );
	}

	async closeCelebrateNotice() {
		if (
			await driverHelper.isElementPresent( this.driver, this.celebrateNoticeCloseButtonSelector )
		) {
			await this.driver.findElement( this.celebrateNoticeCloseButtonSelector ).click();
		} else if (
			await driverHelper.isElementPresent(
				this.driver,
				this.deprecatedCelebrateNoticeCloseButtonSelector
			)
		) {
			await this.driver.findElement( this.deprecatedCelebrateNoticeCloseButtonSelector ).click();
		}
	}

	async siteSetupListExists() {
		await this.closeCelebrateNotice();
		return await driverHelper.isElementPresent( this.driver, this.siteSetupListSelector );
	}

	async isEmailVerified() {
		await this.closeCelebrateNotice();
		await driverHelper.clickWhenClickable( this.driver, this.confirmEmailTaskSelector );
		const badge = await this.driver.findElement( this.taskBadgeSelector );
		const badgeText = await badge.getText();
		return assert( badgeText === 'Complete', 'Could not locate message that email is verified.' );
	}

	async updateHomepageFromSiteSetup() {
		await this.closeCelebrateNotice();
		await driverHelper.clickWhenClickable( this.driver, this.updateHomepageTaskSelector );
		return await driverHelper.clickWhenClickable( this.driver, this.startTaskButtonSelector );
	}
}
