/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WooWizardProductPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#inspector-checkbox-control-10' ) );
	}

	async selectPhysicalProduct() {
		const productSelector = By.css( '#inspector-checkbox-control-10' );
		const buttonSelector = By.css( 'button.woocommerce-profile-wizard__continue:not([disabled])' );
		await driverHelper.clickWhenClickable( this.driver, productSelector );
		return await driverHelper.clickWhenClickable( this.driver, buttonSelector );
	}
}
