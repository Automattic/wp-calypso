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
import GuideComponent from "../components/guide-component";

export default class MyHomePage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.customer-home__main' ), url );
		this.celebrateNoticeCloseButtonSelector = By.css( '.celebrate-notice__action' );
		this.siteSetupListSelector = By.css( '.customer-home__main .site-setup-list' );
		this.updateHomepageTaskSelector = By.css(
			'.customer-home__main [data-task="front_page_updated"]'
		);
		this.confirmEmailTaskSelector = By.css( '.customer-home__main [data-task="email_verified"]' );
		this.startTaskButtonSelector = By.css( '.customer-home__main .site-setup-list__task-action' );
		this.taskBadgeSelector = By.css( '.customer-home__main .site-setup-list__task-badge' );
		this.launchSiteTaskSelector = By.css( '.customer-home__main [data-task="site_launched"]' );
		this.launchSiteTaskCompleteSelector = By.css(
			'.customer-home__main [data-task="site_launched"] .nav-item__complete'
		);
	}

	async _postInit(){
		if ( process.env.FLAGS === 'nav-unification' ) {
			// Makes sure that the nav-unification welcome modal will be dismissed.
			const guideComponent = new GuideComponent( this.driver );
			await guideComponent.dismiss( 1000, '.nav-unification-modal' );
		}
	}

	async closeCelebrateNotice() {
		if (
			await driverHelper.isElementPresent( this.driver, this.celebrateNoticeCloseButtonSelector )
		) {
			await this.driver.findElement( this.celebrateNoticeCloseButtonSelector ).click();
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

	async isSiteLaunched() {
		await this.closeCelebrateNotice();
		return await driverHelper.isElementPresent( this.driver, this.launchSiteTaskCompleteSelector );
	}

	async updateHomepageFromSiteSetup() {
		await this.closeCelebrateNotice();
		await driverHelper.clickWhenClickable( this.driver, this.updateHomepageTaskSelector );
		return await driverHelper.clickWhenClickable( this.driver, this.startTaskButtonSelector );
	}

	async launchSiteFromSiteSetup() {
		await this.closeCelebrateNotice();
		await driverHelper.clickWhenClickable( this.driver, this.launchSiteTaskSelector );
		return await driverHelper.clickWhenClickable( this.driver, this.startTaskButtonSelector );
	}
}
