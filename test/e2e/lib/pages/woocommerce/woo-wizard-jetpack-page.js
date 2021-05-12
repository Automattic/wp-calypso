/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WooWizardJetpackPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.woocommerce-profile-wizard__benefits-card' ) );
	}

	async selectContinueWithJetpack() {
		const buttonLocator = By.css( 'button.is-primary' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, buttonLocator );
		await this.driver.sleep( 5000 );
		await driverHelper.clickWhenClickable( this.driver, buttonLocator );
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			buttonLocator,
			this.explicitWaitMS * 20
		);
	}
}
