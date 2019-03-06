/** @format */

import config from 'config';
import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper.js';
import * as driverManager from '../../driver-manager';
import { getJetpackHost } from '../../data-helper.js';

export default class PickAPlanPage extends AsyncBaseContainer {
	constructor( driver ) {
		super(
			driver,
			By.css( '.plans-features-main__group' ),
			null,
			config.get( 'explicitWaitMS' ) * 2
		);
		this.host = getJetpackHost();
	}

	async selectFreePlan() {
		// During signup, we used to no longer display the Free plan, so we have to click the "Skip" button
		const skipButtonSelector = By.css( '.plans-skip-button button' );
		const skipButtonDisplayed = await driverHelper.isElementPresent(
			this.driver,
			skipButtonSelector
		);
		if ( skipButtonDisplayed === true ) {
			return await driverHelper.clickWhenClickable( this.driver, skipButtonSelector );
		}
		return await this._selectPlan( 'free' );
	}

	// Explicitly select the free button on jetpack without needing `host` above.
	async selectFreePlanJetpack() {
		const disabledPersonalPlanButton = By.css( 'button[disabled].is-personal-plan' );
		const freePlanButton = By.css( '.plans-skip-button button' );

		await driverHelper.waitTillNotPresent( this.driver, disabledPersonalPlanButton );
		return await driverHelper.clickWhenClickable( this.driver, freePlanButton );
	}

	async selectPremiumPlan() {
		return await this._selectPlan( 'premium' );
	}

	async _selectPlan( level ) {
		const plansPrefix =
			driverManager.currentScreenSize() === 'mobile'
				? '.plan-features__mobile'
				: '.plan-features__table';
		const selector = By.css( `${ plansPrefix } button.is-${ level }-plan:not([disabled])` );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}
}
