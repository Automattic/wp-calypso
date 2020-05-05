/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as DriverHelper from '../driver-helper.js';

export default class EditTeamMemberPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.edit-team-member-form' ) );
	}

	async removeUserAndDeleteContent() {
		await DriverHelper.clickWhenClickable( this.driver, By.css( 'input[value="delete"]' ) );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.delete-user__single-site button' )
		);
	}

	async changeToNewRole( roleName ) {
		await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( `select#roles option[value=${ roleName }]` )
		);
		await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.form-button.is-primary:not([disabled])' )
		);
		return await DriverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.is-success' ) );
	}
}
