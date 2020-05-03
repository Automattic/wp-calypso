/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as DriverHelper from '../driver-helper.js';

export default class AcceptInvitePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.invite-accept' ) );
	}

	getEmailPreFilled() {
		return this.driver.findElement( By.css( '#email' ) ).getAttribute( 'value' );
	}

	async enterUsernameAndPasswordAndSignUp( username, password ) {
		await DriverHelper.setWhenSettable( this.driver, By.css( '#username' ), username );
		await DriverHelper.setWhenSettable( this.driver, By.css( '#password' ), password, true );
		return await DriverHelper.clickWhenClickable( this.driver, By.css( '.signup-form__submit' ) );
	}

	async getHeaderInviteText() {
		return await this.driver.findElement( By.css( '.invite-form-header__explanation' ) ).getText();
	}

	async waitUntilNotVisible() {
		return await DriverHelper.waitTillNotPresent(
			this.driver,
			By.css( '#username' ),
			this.explicitWaitMS * 2
		);
	}
}
