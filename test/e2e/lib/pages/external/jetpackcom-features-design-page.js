/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class JetpackComFeaturesDesignPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = 'https://jetpack.com/features/design/';
		}
		super( driver, By.css( 'a#btn-mast-getstarted' ), url );
	}

	async installJetpack() {
		const getStartedLocator = By.css( 'a#btn-mast-getstarted' );
		const installJetpackLocator = By.css(
			".feature-letsgetstarted-main .feature-button-cta[href*='connect']"
		);

		await driverHelper.clickWhenClickable( this.driver, getStartedLocator );
		return await driverHelper.clickWhenClickable( this.driver, installJetpackLocator );
	}
}
