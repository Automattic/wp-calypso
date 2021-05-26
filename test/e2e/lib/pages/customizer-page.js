/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

export default class CustomizerPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-section-customize' ) );
	}

	async _postInit() {
		await driverHelper.waitUntilAbleToSwitchToFrame(
			this.driver,
			By.css( 'iframe[title="Customizer"]' )
		);
	}
}
