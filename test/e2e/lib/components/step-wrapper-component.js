import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class StepWrapperComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.step-wrapper' ) );
	}

	async _postInit() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.step-wrapper a.navigation-link' ),
			this.explicitWaitMS
		);
	}

	async goBack() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.step-wrapper a.navigation-link.back' )
		);
	}
}
