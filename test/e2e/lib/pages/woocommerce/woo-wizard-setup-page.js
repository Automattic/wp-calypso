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
		// helpWoo = false,
	} ) {
		const countryContainerLocator = By.css( '[for="woocommerce-select-control-0__control-input"]' );
		const countryLocator = By.css( `button[id$="${ countryCode }:${ stateCode }"]` );
		const addressLocator = By.id( 'inspector-text-control-0' );
		const address2Locator = By.id( 'inspector-text-control-1' );
		const cityLocator = By.id( 'inspector-text-control-2' );
		// const stateContainerLocator = By.id( 'select2-store_state-container' );
		// const stateLocator = By.css( `li[id$="${ stateCode }"]` );
		const postcodeLocator = By.id( 'inspector-text-control-3' );
		// const currencyContainerLocator = By.id( 'select2-currency_code-container' );
		// const currencyLocator = By.css( `li[id$="${ currency }"]` );
		// const productTypeContainerLocator = By.id( 'select2-product_type-container' );
		// const productTypeLocator = By.css( `li[id$="${ productType }"]` );
		// const inPersonLocator = By.id( 'woocommerce_sell_in_person' );
		// const helpWooLocator = By.css(
		// 	'.woocommerce-profile-wizard__tracking #inspector-checkbox-control-1'
		// );
		const submitButtonLocator = By.css( 'button.components-button.is-button.is-primary' );
		const continueButtonLocator = By.css( '.woocommerce-profile-wizard__usage-wrapper button' );

		await driverHelper.clickWhenClickable( this.driver, countryContainerLocator );
		await driverHelper.clickWhenClickable( this.driver, countryLocator );
		await driverHelper.setWhenSettable( this.driver, addressLocator, address );
		await driverHelper.setWhenSettable( this.driver, address2Locator, address2 );
		await driverHelper.setWhenSettable( this.driver, cityLocator, city );
		// await driverHelper.clickWhenClickable( this.driver, stateContainerLocator );
		// await driverHelper.clickWhenClickable( this.driver, stateLocator );
		await driverHelper.setWhenSettable( this.driver, postcodeLocator, postalCode );
		// await driverHelper.clickWhenClickable( this.driver, currencyContainerLocator );
		// await driverHelper.clickWhenClickable( this.driver, currencyLocator );
		// await driverHelper.clickWhenClickable( this.driver, productTypeContainerLocator );
		// await driverHelper.clickWhenClickable( this.driver, productTypeLocator );

		// if ( inPerson ) {
		// 	await driverHelper.setCheckbox( this.driver, inPersonLocator );
		// } else {
		// 	await driverHelper.unsetCheckbox( this.driver, inPersonLocator );
		// }

		await driverHelper.clickWhenClickable( this.driver, submitButtonLocator );

		// if ( helpWoo ) {
		// 	await driverHelper.clickWhenClickable( this.driver, helpWooLocator );
		// }

		return await driverHelper.clickWhenClickable( this.driver, continueButtonLocator );
	}
}
