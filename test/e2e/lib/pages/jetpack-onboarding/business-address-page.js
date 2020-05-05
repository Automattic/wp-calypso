/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class BusinessAddressPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-onboarding' ) );
	}

	async selectAddBusinessAddress() {
		const businessAddressSelector = By.css( '.card[data-e2e-type="business-address"] button' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, businessAddressSelector );
		return await driverHelper.clickWhenClickable( this.driver, businessAddressSelector );
	}

	async selectContinue() {
		const continueSelector = By.css( '.card[data-e2e-type="continue"] button' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, continueSelector );
		return await driverHelper.clickWhenClickable( this.driver, continueSelector );
	}

	async enterBusinessAddressAndSubmit( name, street, city, state, zip, country ) {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '#name' ) );
		await driverHelper.setWhenSettable( this.driver, By.css( '#name' ), name );
		await driverHelper.setWhenSettable( this.driver, By.css( '#street' ), street );
		await driverHelper.setWhenSettable( this.driver, By.css( '#city' ), city );
		await driverHelper.setWhenSettable( this.driver, By.css( '#state' ), state );
		await driverHelper.setWhenSettable( this.driver, By.css( '#zip' ), zip );
		await driverHelper.setWhenSettable( this.driver, By.css( '#country' ), country );
		return await driverHelper.clickWhenClickable( this.driver, By.css( 'button.is-primary' ) );
	}
}
