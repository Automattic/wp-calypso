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

	// To buy a Jetpack Plan, we search for `planName` in every CTA on the page.
	async buyJetpackPlan( planName ) {
		const planCTA = By.xpath( `//button[@type='button' and contains(., 'Get ${ planName }')]` );
		return await driverHelper.clickWhenClickable( this.driver, planCTA );
	}
}
