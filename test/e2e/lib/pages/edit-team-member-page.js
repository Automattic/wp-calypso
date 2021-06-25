/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';

export default class EditTeamMemberPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.edit-team-member-form' ) );
	}

	async removeUserAndDeleteContent() {
		await driverHelper.clickWhenClickable( this.driver, By.css( 'input[value="delete"]' ) );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.delete-user__single-site button' )
		);
	}

	async changeToNewRole( roleName ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `select#roles option[value=${ roleName }]` )
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.form-button.is-primary:not([disabled])' )
		);
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.is-success' )
		);
	}
}
