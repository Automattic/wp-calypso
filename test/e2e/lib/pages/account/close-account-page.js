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
		const buttonLocator = by.css( '.account-close button.is-scary' );
		const confirmButtonLocator = by.css( '.dialog__action-buttons button.is-primary' );
		const confirmDialogLocator = by.css( '.account-close__confirm-dialog' );
		const pauseBetweenClickAttemptsMS = 100;

		// Click doesn't always fire even if the button is already displayed.
		// We can safely attempt to click the button until the confirmation dialog pop-up window is present.
		for ( let i = 0; i < explicitWaitMS / pauseBetweenClickAttemptsMS; i++ ) {
			await driverHelper.clickWhenClickable( this.driver, buttonLocator );
			if ( await driverHelper.isElementLocated( this.driver, confirmDialogLocator ) ) {
				await driverHelper.clickWhenClickable( this.driver, confirmButtonLocator );
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
		await driverHelper.waitUntilElementNotLocated(
			this.driver,
			by.css( '.dialog button.is-scary[disabled]' )
		);
		return driverHelper.clickWhenClickable( this.driver, by.css( '.dialog button.is-scary' ) );
	}

	async confirmAccountHasBeenClosed() {
		const messageLocator = driverHelper.createTextLocator(
			by.css( '.empty-content__title' ),
			'Your account has been closed'
		);
		await driverHelper.waitUntilElementLocated( this.driver, messageLocator );
		return driverHelper.clickWhenClickable( this.driver, by.css( 'button.empty-content__action' ) );
	}
}
