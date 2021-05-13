/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WooWizardExtrasPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content ul.recommended-step' ) );
	}

	async selectContinue() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( 'button.button-next' ) );
	}
}
