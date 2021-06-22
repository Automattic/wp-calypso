/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class AcceptInvitePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.invite-accept' ) );
	}

	async getEmailPreFilled() {
		return await this.driver.findElement( By.css( '#email' ) ).getAttribute( 'value' );
	}

	async enterCredentialsAndSignUp( username, email, password ) {
		await driverHelper.setWhenSettable( this.driver, By.css( '#email' ), email );
		await driverHelper.setWhenSettable( this.driver, By.css( '#password' ), password, true );
		// set the username field if present
		if (
			await driverHelper
				.waitUntilElementLocatedAndVisible( this.driver, By.css( '#username' ), 50 )
				.catch( () => false )
		) {
			await driverHelper.setWhenSettable( this.driver, By.css( '#username' ), username );
		}
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.signup-form__submit' ) );
	}

	async getHeaderInviteText() {
		return await this.driver.findElement( By.css( '.invite-form-header__explanation' ) ).getText();
	}

	async waitUntilNotVisible() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '#email' ),
			this.explicitWaitMS * 2
		);
	}
}
