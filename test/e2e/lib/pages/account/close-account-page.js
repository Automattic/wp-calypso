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
		const confirmButtonSelector = by.css( '.dialog__action-buttons button.is-primary' );
		const confirmDialogSelector = by.css( '.account-close__confirm-dialog' );
		const pauseBetweenClickAttemptsMS = 100;

		await driverHelper.waitTillPresentAndDisplayed( this.driver, buttonSelector );

		// Click doesn't always fire even if the button is already displayed.
		// We can safely attempt to click the button until the confirmation dialog pop-up window is present.
		for ( let i = 0; i < explicitWaitMS / pauseBetweenClickAttemptsMS; i++ ) {
			await driverHelper.clickWhenClickable( this.driver, buttonSelector );
			if ( await driverHelper.isElementPresent( this.driver, confirmDialogSelector ) ) {
				await driverHelper.clickWhenClickable( this.driver, confirmButtonSelector );
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

	async ConfirmAccountHasBeenClosed() {
		await driverHelper.verifyTextPresent(
			this.driver,
			by.css( '.empty-content__title' ),
			'Your account has been closed'
		);
		return driverHelper.clickWhenClickable( this.driver, by.css( 'button.empty-content__action' ) );
	}
}
