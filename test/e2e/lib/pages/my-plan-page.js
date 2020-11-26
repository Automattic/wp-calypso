/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';

export default class MyPlanPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-section-plans .current-plan' ) );
	}

	async openPlansTab() {
		await driverHelper.ensureMobileMenuOpen( this.driver );
		const selector = By.css(
			'.current-plan a[href*="plans"]:not([href*="my-plan"]).section-nav-tab__link'
		);
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async isSecurityPlan() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '[data-e2e-product-slug="jetpack_security_daily"]' )
		);
	}
}
