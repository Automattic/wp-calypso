import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThemeSwitchConfirmationComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.themes__auto-loading-homepage-modal' ) );
	}

	async _postInit() {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.themes__auto-loading-homepage-modal h1' ),
			this.explicitWaitMS
		);
	}

	async activateTheme() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog button[data-e2e-button="activeTheme"]' )
		);
	}
}
