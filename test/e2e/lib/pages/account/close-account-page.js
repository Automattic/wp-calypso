/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class CloseAccountPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.account-close' ) );
	}

	async chooseCloseAccount() {
		const buttonLocator = By.css( '.account-close button.is-scary' );
		const confirmButtonLocator = By.css( '.dialog__action-buttons button.is-primary' );
		const confirmDialogLocator = By.css( '.account-close__confirm-dialog' );
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
			By.css( '.account-close__confirm-dialog-confirm-input' ),
			accountName
		);
		await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.dialog button.is-scary[disabled]' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog button.is-scary' )
		);
	}

	async confirmAccountHasBeenClosed() {
		const messageLocator = driverHelper.createTextLocator(
			By.css( '.empty-content__title' ),
			'Your account has been closed'
		);
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, messageLocator );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.empty-content__action' )
		);
	}
}
