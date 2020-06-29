/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WooWizardSetupPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#inspector-text-control-0' ) );
	}

	async enterStoreDetailsAndSubmit( {
		countryCode,
		stateCode,
		address,
		address2,
		city,
		postalCode,
		// currency,
		// productType,
		// inPerson = false,
		helpWoo = false,
	} ) {
		const countryContainerSelector = By.id( 'woocommerce-select-control-0__control-input' );
		const countrySelector = By.css( `button[id$="${ countryCode }:${ stateCode }"]` );
		const addressSelector = By.id( 'inspector-text-control-0' );
		const address2Selector = By.id( 'inspector-text-control-1' );
		const citySelector = By.id( 'inspector-text-control-2' );
		// const stateContainerSelector = By.id( 'select2-store_state-container' );
		// const stateSelector = By.css( `li[id$="${ stateCode }"]` );
		const postcodeSelector = By.id( 'inspector-text-control-3' );
		// const currencyContainerSelector = By.id( 'select2-currency_code-container' );
		// const currencySelector = By.css( `li[id$="${ currency }"]` );
		// const productTypeContainerSelector = By.id( 'select2-product_type-container' );
		// const productTypeSelector = By.css( `li[id$="${ productType }"]` );
		// const inPersonSelector = By.id( 'woocommerce_sell_in_person' );
		const helpWooSelector = By.css(
			'.woocommerce-profile-wizard__tracking #inspector-checkbox-control-1'
		);
		const submitButtonSelector = By.css( 'button.components-button.is-button.is-primary' );
		const continueButtonSelector = By.css( '.woocommerce-profile-wizard__usage-wrapper button' );

		await driverHelper.clickWhenClickable( this.driver, countryContainerSelector );
		await driverHelper.clickWhenClickable( this.driver, countrySelector );
		await driverHelper.setWhenSettable( this.driver, addressSelector, address );
		await driverHelper.setWhenSettable( this.driver, address2Selector, address2 );
		await driverHelper.setWhenSettable( this.driver, citySelector, city );
		// await driverHelper.clickWhenClickable( this.driver, stateContainerSelector );
		// await driverHelper.clickWhenClickable( this.driver, stateSelector );
		await driverHelper.setWhenSettable( this.driver, postcodeSelector, postalCode );
		// await driverHelper.clickWhenClickable( this.driver, currencyContainerSelector );
		// await driverHelper.clickWhenClickable( this.driver, currencySelector );
		// await driverHelper.clickWhenClickable( this.driver, productTypeContainerSelector );
		// await driverHelper.clickWhenClickable( this.driver, productTypeSelector );

		// if ( inPerson ) {
		// 	await driverHelper.setCheckbox( this.driver, inPersonSelector );
		// } else {
		// 	await driverHelper.unsetCheckbox( this.driver, inPersonSelector );
		// }

		await driverHelper.clickWhenClickable( this.driver, submitButtonSelector );

		if ( ! helpWoo ) {
			await driverHelper.clickWhenClickable( this.driver, helpWooSelector );
		}

		return await driverHelper.clickWhenClickable( this.driver, continueButtonSelector );
	}
}
