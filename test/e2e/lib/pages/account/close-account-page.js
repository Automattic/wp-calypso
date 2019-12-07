/** @format */

/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class CloseAccountPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.account-close' ) );
	}

	async chooseCloseAccount() {
		const buttonSelector = by.css( '.account-close button.is-scary' );
		const confirmDialogSelector = by.css( '.account-close__confirm-dialog-confirm-input' );
		const pauseBetweenClickAttemptsMS = 100;

		await driverHelper.waitTillPresentAndDisplayed( this.driver, buttonSelector );

		// Click doesn't always fire even if the button is already displayed.
		// We can safely attempt to click the button until the confirmation dialog pop-up window is present.
		for ( let i = 0; i < explicitWaitMS / pauseBetweenClickAttemptsMS; i++ ) {
			await driverHelper.clickWhenClickable( this.driver, buttonSelector );
			if ( await driverHelper.isElementPresent( this.driver, confirmDialogSelector ) ) {
				return true;
			}
			await this.driver.sleep( pauseBetweenClickAttemptsMS );
		}
		return false;
	}

	async enterAccountNameAndClose( accountName ) {
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.account-close__confirm-dialog-confirm-input' ),
			accountName
		);
		await driverHelper.waitTillNotPresent(
			this.driver,
			by.css( '.dialog button.is-scary[disabled]' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.dialog button.is-scary' )
		);
	}
}
