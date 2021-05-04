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
		const buttonSelector = By.css( 'button.is-primary' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, buttonSelector );
		await this.driver.sleep( 5000 );
		await driverHelper.clickWhenClickable( this.driver, buttonSelector );
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			buttonSelector,
			this.explicitWaitMS * 20
		);
	}
}
