import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper.js';

export default class SiteStylePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-style__form-wrapper' ) );
	}

	async submitForm() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.site-style__form-wrapper button.is-primary' )
		);
	}
}
