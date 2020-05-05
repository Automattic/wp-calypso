/**
 * External dependencies
 */
import config from 'config';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
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
		await driverHelper.scrollIntoView( this.driver, freePlanButton );
		return await driverHelper.clickWhenClickable( this.driver, freePlanButton );
	}

	async selectPremiumPlan() {
		return await this._selectPlan( 'premium' );
	}

	async _selectPlan( level ) {
		// We are switching from two separate designs for mobile and desktop plans to one. There will be two buttons -
		// one visible and one hidden in control and only one button in the test variation.
		const planSelector =
			driverManager.currentScreenSize() === 'mobile'
				? `.plan-features__mobile button.is-${ level }-plan, .plan-features__table button.is-${ level }-plan`
				: `.plan-features__table button.is-${ level }-plan`;

		let selector = By.css( planSelector );

		if ( level === 'free' ) {
			if ( ! ( await driverHelper.isElementPresent( this.driver, selector ) ) ) {
				selector = By.css( '.plans-features-main__banner-content button' );
			}
		}
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css(
				'.plan-features__mobile button.is-business-plan, .plan-features__table button.is-business-plan'
			)
		);
		await this.scrollPlanInToView( level );

		await driverHelper.clickWhenClickable( this.driver, selector );
		try {
			await driverHelper.waitTillNotPresent( this.driver, selector );
		} catch {
			//If the first click doesn't take, try again
			await driverHelper.clickWhenClickable( this.driver, selector );
		}
	}

	async scrollPlanInToView( level ) {
		// Defaults to showing business plan first, so we need to move to correct plan
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			switch ( level ) {
				case 'premium':
					await this.clickDirectionArrow( 'left' );
					break;
				case 'personal':
					await this.clickDirectionArrow( 'left' );
					await this.clickDirectionArrow( 'left' );
					break;
				case 'ecommerce':
					await this.clickDirectionArrow( 'right' );
					break;
				default:
					break;
			}
		}
	}

	async clickDirectionArrow( direction ) {
		const arrowSelector = By.css( `.plan-features__scroll-${ direction } button` );
		return await driverHelper.clickWhenClickable( this.driver, arrowSelector );
	}
}
