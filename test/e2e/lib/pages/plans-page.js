/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';
import * as dataHelper from '../data-helper';
import { currentScreenSize } from '../driver-manager';

const by = webdriver.By;
const host = dataHelper.getJetpackHost();

export default class PlansPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.is-section-plans' ) );
	}

	async openPlansTab() {
		await driverHelper.ensureMobileMenuOpen( this.driver );
		const selector = by.css(
			'.current-plan a[href*="plans"]:not([href*="my-plan"]).section-nav-tab__link'
		);
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async waitForComparison() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.plans-features-main__group' )
		);
	}

	async returnFromComparison() {
		return await driverHelper.clickWhenClickable( this.driver, by.css( '.header-cake__back' ) );
	}

	async onePrimaryButtonShown() {
		const selector =
			currentScreenSize() === 'mobile'
				? '.plan-features__mobile .plan-features__actions-button.is-primary'
				: '.plan-features__table-item.is-top-buttons button.plan-features__actions-button.is-primary';
		const count = await driverHelper.getElementCount( this.driver, by.css( selector ) );
		return count === 1;
	}

	async confirmCurrentPlan( planName ) {
		let selector = by.css( `.is-current.is-${ planName }-plan` );
		if ( host !== 'WPCOM' ) {
			selector = by.css( `.is-${ planName }-plan` );
		}

		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	async planTypesShown( planType ) {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( `[data-e2e-plans="${ planType }"]` )
		);
	}

	async selectBusinessPlan() {
		// Wait a little for loading animation
		await this.driver.sleep( 1000 );
		if ( currentScreenSize() === 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.plan-features__mobile button.is-business-plan' )
			);
		}

		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'td.is-top-buttons button.is-business-plan' )
		);
	}
}
