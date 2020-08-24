/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WooWizardWelcomePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( ".wc-setup-actions button[name='save_step']" ) );
	}

	async start() {
		const selector = By.css( ".wc-setup-actions button[name='save_step']" );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}
}
