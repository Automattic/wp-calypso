/**
 * External dependencies
 */
import assert from 'assert';
import { By } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );

export default class ChecklistPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.customer-home__layout .checklist' ), url );
		this.headerSelector = By.css( '.customer-home__layout .checklist-site-setup__heading' );
		this.updateHomepageTaskSelector = By.css(
			'.customer-home__layout .checklist__task button.checklist__task-title-button'
		);
		this.updateHomepageButtonSelector = By.css(
			'.customer-home__layout button[data-e2e-action="update-homepage"]'
		);
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
		const items = await this.driver.findElements( this.updateHomepageTaskSelector );
		for ( let i = 0; i < items.length; i++ ) {
			await items[ i ].click();
			if (
				await driverHelper.isEventuallyPresentAndDisplayed(
					this.driver,
					this.updateHomepageButtonSelector,
					mochaTimeOut / 2
				)
			) {
				return await driverHelper.clickWhenClickable(
					this.driver,
					this.updateHomepageButtonSelector
				);
			}
		}
	}
}
