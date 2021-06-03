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

	async enterUsernameAndPasswordAndSignUp( username, password ) {
		await driverHelper.setWhenSettable( this.driver, By.css( '#username' ), username );
		await driverHelper.setWhenSettable( this.driver, By.css( '#password' ), password, true );
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.signup-form__submit' ) );
	}

	async getHeaderInviteText() {
		return await this.driver.findElement( By.css( '.invite-form-header__explanation' ) ).getText();
	}

	async waitUntilNotVisible() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '#username' ),
			this.explicitWaitMS * 2
		);
	}
}
