import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';

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
