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
		const isCompositeCheckout = await this.isCompositeCheckout();
		if ( isCompositeCheckout ) {
			await driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.checkout-review-order.is-summary' )
			);
			// If the contact details are already pre-filled and valid, the contact
			// details step will be skipped in composite checkout. Therefore we'll
			// need to click to edit that step before being able to modify it.
			await driverHelper.clickIfPresent(
				this.driver,
				By.css( 'button[aria-label="Edit the contact details"]' )
			);
		}

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
		return await driverHelper.isElementLocated( this.driver, By.css( '.composite-checkout' ) );
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

	async close() {
		const closeButtonLocator = By.css( '.masterbar__secure-checkout .masterbar__close-button' );
		await driverHelper.clickIfPresent( this.driver, closeButtonLocator );
	}
}
