/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WooWizardBusinessDetailsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#woocommerce-select-control-1__control-input' ) );
	}

	async fillBusinessInfo() {
		const buttonSelector = By.css( 'button.woocommerce-profile-wizard__continue:not([disabled])' );
		const productsCountContainer = By.css(
			'label[for="woocommerce-select-control-1__control-input"]'
		);
		const productsCountSelector = By.css( '#woocommerce-select-control__option-1-1-10' );
		const sellingElsewhereContainer = By.css(
			'label[for="woocommerce-select-control-2__control-input"]'
		);
		const sellingElsewhereAnswer = By.css( '#woocommerce-select-control__option-2-no' );

		await driverHelper.clickWhenClickable( this.driver, productsCountContainer );
		await driverHelper.clickWhenClickable( this.driver, productsCountSelector );
		await driverHelper.clickWhenClickable( this.driver, sellingElsewhereContainer );
		await driverHelper.clickWhenClickable( this.driver, sellingElsewhereAnswer );
		return await driverHelper.clickWhenClickable( this.driver, buttonSelector );
	}
}
