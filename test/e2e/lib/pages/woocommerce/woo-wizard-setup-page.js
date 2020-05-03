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
		super( driver, By.css( 'div.wc-setup-content form.address-step' ) );
	}

	async enterStoreDetailsAndSubmit( {
		countryCode,
		stateCode,
		address,
		address2,
		city,
		postalCode,
		currency,
		productType,
		inPerson = false,
		helpWoo = false,
	} ) {
		const countryContainerSelector = By.id( 'select2-store_country-container' );
		const countrySelector = By.css( `li[id$="${ countryCode }"]` );
		const addressSelector = By.id( 'store_address' );
		const address2Selector = By.id( 'store_address_2' );
		const citySelector = By.id( 'store_city' );
		const stateContainerSelector = By.id( 'select2-store_state-container' );
		const stateSelector = By.css( `li[id$="${ stateCode }"]` );
		const postcodeSelector = By.id( 'store_postcode' );
		const currencyContainerSelector = By.id( 'select2-currency_code-container' );
		const currencySelector = By.css( `li[id$="${ currency }"]` );
		const productTypeContainerSelector = By.id( 'select2-product_type-container' );
		const productTypeSelector = By.css( `li[id$="${ productType }"]` );
		const inPersonSelector = By.id( 'woocommerce_sell_in_person' );
		const helpWooSelector = By.css( '#wc_tracker_checkbox_dialog' );
		const submitButtonSelector = By.css( 'button[name="save_step"]' );
		const continueButtonSelector = By.css( '#wc_tracker_submit' );

		await driverHelper.clickWhenClickable( this.driver, countryContainerSelector );
		await driverHelper.clickWhenClickable( this.driver, countrySelector );
		await driverHelper.setWhenSettable( this.driver, addressSelector, address );
		await driverHelper.setWhenSettable( this.driver, address2Selector, address2 );
		await driverHelper.setWhenSettable( this.driver, citySelector, city );
		await driverHelper.clickWhenClickable( this.driver, stateContainerSelector );
		await driverHelper.clickWhenClickable( this.driver, stateSelector );
		await driverHelper.setWhenSettable( this.driver, postcodeSelector, postalCode );
		await driverHelper.clickWhenClickable( this.driver, currencyContainerSelector );
		await driverHelper.clickWhenClickable( this.driver, currencySelector );
		await driverHelper.clickWhenClickable( this.driver, productTypeContainerSelector );
		await driverHelper.clickWhenClickable( this.driver, productTypeSelector );

		if ( inPerson ) {
			await driverHelper.setCheckbox( this.driver, inPersonSelector );
		} else {
			await driverHelper.unsetCheckbox( this.driver, inPersonSelector );
		}

		await driverHelper.clickWhenClickable( this.driver, submitButtonSelector );

		if ( ! helpWoo ) {
			await driverHelper.clickWhenClickable( this.driver, helpWooSelector );
		}

		return await driverHelper.clickWhenClickable( this.driver, continueButtonSelector );
	}
}
