import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper.js';

export default class ChooseAThemePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.themes-list' ) );
	}

	async selectFirstTheme() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.theme__thumbnail img' ),
			this.explicitWaitMS
		);
	}
}
