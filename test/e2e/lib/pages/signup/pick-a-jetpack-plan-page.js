/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
// eslint-disable-next-line wpcalypso/no-package-relative-imports
import config from 'config';
import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper.js';
import * as driverManager from '../../driver-manager';
import { getJetpackHost } from '../../data-helper.js';

export default class PickAJetpackPlanPage extends AsyncBaseContainer {
	constructor( driver ) {
		const css = '.selector-alt__main';
		super( driver, By.css( css ), null, config.get( 'explicitWaitMS' ) * 2 );
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

	async selectFreePlanJetpack() {
		const freePlanButton = By.css( '.jetpack-free-card-alt__main a.button' );
		await driverHelper.scrollIntoView( this.driver, freePlanButton );
		return await driverHelper.clickWhenClickable( this.driver, freePlanButton );
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
				case 'business':
					await this.clickDirectionArrow( 'right' );
					break;
				case 'personal':
					await this.clickDirectionArrow( 'left' );
					await this.clickDirectionArrow( 'left' );
					break;
				case 'ecommerce':
					await this.clickDirectionArrow( 'right' );
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
