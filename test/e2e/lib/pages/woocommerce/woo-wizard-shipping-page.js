/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WooWizardShippingPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content ul.shipping' ) );
	}

	async selectContinue() {
		const continueButtonSelector = By.css( 'button.button-next' );
		return await driverHelper.clickWhenClickable( this.driver, continueButtonSelector );
	}

	async fillFlatRates( price = 20 ) {
		const domesticCostSelector = By.css(
			'input[name="shipping_zones[domestic][flat_rate][cost]"]'
		);
		const intlCostSelector = By.css( 'input[name="shipping_zones[intl][flat_rate][cost]"]' );

		await this.driver.findElement( domesticCostSelector ).sendKeys( price );
		return await this.driver.findElement( intlCostSelector ).sendKeys( price );
	}
}
