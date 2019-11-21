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
		super( driver, By.css( '.checklist.main' ), url );
		this.headerSelector = By.css( '.checklist.main .formatted-header__title' );
		this.subheaderSelector = By.css( '.checklist.main .formatted-header__subtitle' );
	}

	async headerExists() {
		return await driverHelper.isElementPresent( this.driver, this.headerSelector );
	}

	async subheaderExists() {
		return await driverHelper.isElementPresent( this.driver, this.subheaderSelector );
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
}
