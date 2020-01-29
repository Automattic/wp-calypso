/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';
import AsyncBaseContainer from '../../async-base-container';
import * as dataHelper from '../../data-helper';

export default class AccountSettingsPage extends AsyncBaseContainer {
	constructor( driver, url = dataHelper.getCalypsoURL( 'me/account' ) ) {
		super( driver, by.css( '.account.main' ), url );
	}

	async chooseCloseYourAccount() {
		const closeAccountSelector = by.css( '.account__settings-close' );
		await driverHelper.scrollIntoView( this.driver, closeAccountSelector, 'end' );
		return await driverHelper.clickWhenClickable( this.driver, closeAccountSelector );
	}

	async getUsername() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.profile-gravatar__user-display-name' )
		);
		return await this.driver
			.findElement( by.css( '.profile-gravatar__user-display-name' ) )
			.getText();
	}
}
