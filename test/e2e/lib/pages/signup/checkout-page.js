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
		super( driver, By.css( '.checkout' ), url, config.get( 'explicitWaitMS' ) * 2 );
	}

	async enterRegistarDetails( {
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

		return await driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), postalCode );
	}

	async submitForm() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( 'button[type="submit"]' ) );
	}
}
