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
		// set the username field if present.
		// in this particular case, 50ms is enough.
		// because we know the page is fully rendered if the password field above was settable
		if (
			await driverHelper.isElementEventuallyLocatedAndVisible(
				this.driver,
				By.css( '#username' ),
				50
			)
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
