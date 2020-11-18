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
			url = 'https://cloud.jetpack.com/pricing/';
		}
		super( driver, By.css( '.is-section-jetpack-cloud-pricing .selector-alt__main' ), url );
	}

	async buyJetpackPlan( planSlug ) {
		const planCTA = By.css( `[data-e2e-product-slug="${ planSlug }"]` );
		return await driverHelper.clickWhenClickable( this.driver, planCTA );
	}
}
