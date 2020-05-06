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

export default class ChecklistPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.customer-home__main .site-setup-list' ), url );
		this.headerSelector = By.css( '.customer-home__main .site-setup-list .card-heading' );
		this.updateHomepageTaskSelector = By.css(
			'.customer-home__main [data-task="front_page_updated"]'
		);
		this.startTaskButtonSelector = By.css( '.customer-home__main .site-setup-list__task-action' );
	}

	async headerExists() {
		return await driverHelper.isElementPresent( this.driver, this.headerSelector );
	}

	async isEmailverified() {
		const element = await this.driver.findElement(
			By.css( '.is-completed .checklist__task-title' )
		);
		const emailVerifiedMessage = await element.getText();
		return assert(
			emailVerifiedMessage === 'You validated your email address',
			'Could not locate message that email is verified.'
		);
	}

	async updateHomepage() {
		await driverHelper.clickWhenClickable( this.driver, this.updateHomepageTaskSelector );
		return await driverHelper.clickWhenClickable( this.driver, this.startTaskButtonSelector );
	}
}
