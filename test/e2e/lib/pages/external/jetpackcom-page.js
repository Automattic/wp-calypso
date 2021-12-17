import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container.js';
import * as driverHelper from '../../driver-helper.js';
import * as driverManager from '../../driver-manager.js';

export default class JetpackComPage extends AsyncBaseContainer {
	constructor( driver, url = 'https://jetpack.com/' ) {
		super( driver, By.css( '.logo[title="Jetpack"]' ), url );
	}

	async selectGetStarted() {
		const onMobile = driverManager.currentScreenSize() === 'mobile';
		const mobileToggleLocator = By.css( '#mobilenav-toggle' );
		const getStartedLocator = By.css( '.install a' );
		if ( onMobile ) {
			await driverHelper.clickWhenClickable( this.driver, mobileToggleLocator );
		}
		return await driverHelper.clickWhenClickable( this.driver, getStartedLocator );
	}
}
