/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WooWizardThemePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.woocommerce-profile-wizard__themes' ) );
	}

	async skip() {
		const buttonSelector = By.css( '.woocommerce-profile-wizard__skip' );
		return await driverHelper.clickWhenClickable( this.driver, buttonSelector );
	}
}
