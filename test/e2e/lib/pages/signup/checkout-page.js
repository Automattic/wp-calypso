/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper.js';

export default class CheckOutPage extends AsyncBaseContainer {
	constructor( driver, url = null ) {
		super(
			driver,
			By.css( '.checkout,.composite-checkout' ),
			url,
			2 * config.get( 'explicitWaitMS' )
		);
	}

	async enterRegistrarDetails( {
		firstName,
		lastName,
		emailAddress,
		phoneNumber,
		countryCode,
		address,
		city,
		stateCode,
		postalCode,
	} ) {
		await driverHelper.setWhenSettable( this.driver, By.id( 'first-name' ), firstName );
		await driverHelper.setWhenSettable( this.driver, By.id( 'last-name' ), lastName );
		await driverHelper.setWhenSettable( this.driver, By.id( 'email' ), emailAddress );

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `select.phone-input__country-select option[value="${ countryCode }"]` )
		);

		await driverHelper.setWhenSettable( this.driver, By.css( 'input[name="phone"]' ), phoneNumber );

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `select[name=country-code] option[value="${ countryCode }"]` )
		);

		await driverHelper.setWhenSettable( this.driver, By.id( 'address-1' ), address );
		await driverHelper.setWhenSettable( this.driver, By.id( 'city' ), city );

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `select[name=state] option[value="${ stateCode }"]` )
		);

		await driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), postalCode );
	}

	async isCompositeCheckout() {
		return driverHelper.isElementPresent( this.driver, By.css( '.composite-checkout' ) );
	}

	async submitForm() {
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( isCompositeCheckout ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( 'button[aria-label="Continue with the entered contact details"]' )
			);
		}
		return await driverHelper.clickWhenClickable( this.driver, By.css( 'button[type="submit"]' ) );
	}
}
