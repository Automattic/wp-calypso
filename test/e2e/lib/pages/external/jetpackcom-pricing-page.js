/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class JetpackComPricingPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = 'https://jetpack.com/pricing/';
		}
		super( driver, By.css( '.plans-pricing-comparison' ), url );
	}

	async buyPremium() {
		const buyPremiumSelector = By.css( '#page-pricing-premium-col-cta-top' );
		return await driverHelper.clickWhenClickable( this.driver, buyPremiumSelector );
	}
}
