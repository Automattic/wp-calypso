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
import GuideComponent from '../components/guide-component';

export default class MyHomePage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.customer-home__main' ), url );
		this.celebrateNoticeCloseButtonLocator = By.css( '.celebrate-notice__action' );
		this.siteSetupListLocator = By.css( '.customer-home__main .site-setup-list' );
		this.updateHomepageTaskLocator = By.css(
			'.customer-home__main [data-task="front_page_updated"]'
		);
		this.confirmEmailTaskLocator = By.css( '.customer-home__main [data-task="email_verified"]' );
		this.startTaskButtonLocator = By.css( '.customer-home__main .site-setup-list__task-action' );
		this.taskBadgeLocator = By.css( '.customer-home__main .site-setup-list__task-badge' );
		this.launchSiteTaskLocator = By.css( '.customer-home__main [data-task="site_launched"]' );
		this.launchSiteTaskCompleteLocator = By.css(
			'.customer-home__main [data-task="site_launched"] .nav-item__complete'
		);
		this.celebrateNoticeTitleLocator = By.css( '.celebrate-notice__title' );
	}

	async _postInit() {
		if ( process.env.FLAGS === 'nav-unification' ) {
			// Makes sure that the nav-unification welcome modal will be dismissed.
			const guideComponent = new GuideComponent( this.driver );
			await guideComponent.dismiss( 1000, '.nav-unification-modal' );
		}
	}

	async closeCelebrateNotice() {
		if (
			await driverHelper.isElementLocated( this.driver, this.celebrateNoticeCloseButtonLocator )
		) {
			await this.driver.findElement( this.celebrateNoticeCloseButtonLocator ).click();
		}
	}

	async siteSetupListExists() {
		await this.closeCelebrateNotice();
		return await driverHelper.isElementLocated( this.driver, this.siteSetupListLocator );
	}

	async isEmailVerified() {
		await this.closeCelebrateNotice();
		await driverHelper.clickWhenClickable( this.driver, this.confirmEmailTaskLocator );
		const badge = await this.driver.findElement( this.taskBadgeLocator );
		const badgeText = await badge.getText();
		return assert( badgeText === 'Complete', 'Could not locate message that email is verified.' );
	}

	async waitForSiteLaunchComplete() {
		await driverHelper.waitUntilElementLocated( this.driver, this.celebrateNoticeTitleLocator );
		const notice = await this.driver.findElement( this.celebrateNoticeTitleLocator );
		const noticeText = await notice.getText();
		return assert(
			noticeText === 'You launched your site!',
			'Could not locate message that site was launched.'
		);
	}

	async updateHomepageFromSiteSetup() {
		await this.closeCelebrateNotice();
		await driverHelper.clickWhenClickable( this.driver, this.updateHomepageTaskLocator );
		return await driverHelper.clickWhenClickable( this.driver, this.startTaskButtonLocator );
	}

	async launchSiteFromSiteSetup() {
		await this.closeCelebrateNotice();
		await driverHelper.clickWhenClickable( this.driver, this.launchSiteTaskLocator );
		return await driverHelper.clickWhenClickable( this.driver, this.startTaskButtonLocator );
	}
}
