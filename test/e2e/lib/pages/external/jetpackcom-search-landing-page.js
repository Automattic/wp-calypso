import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class JetpackComSearchLandingPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = 'https://jetpack.com/upgrade/search';
		}
		super( driver, By.css( '.page-template-landing-page-search' ), url );
	}

	async upgrade() {
		const buyPremiumLocator = By.css( '#landing-page-search-primary-cta' );
		return await driverHelper.clickWhenClickable( this.driver, buyPremiumLocator );
	}
}
