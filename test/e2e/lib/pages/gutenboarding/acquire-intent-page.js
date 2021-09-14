import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class AcquireIntentPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.acquire-intent' ) );
		this.nextButtonLocator = By.css( '.action-buttons__next' );
		this.skipButtonLocator = By.css( '.action-buttons__skip' );
	}

	async enterSiteTitle( siteTitle ) {
		const siteTitleLocator = By.css( '.acquire-intent-text-input__input' );
		return await driverHelper.setWhenSettable( this.driver, siteTitleLocator, siteTitle, {
			pauseBetweenKeysMS: 10,
		} );
	}

	async goToNextStep() {
		await driverHelper.clickWhenClickable( this.driver, this.nextButtonLocator );
		await this.driver.switchTo().defaultContent();
	}

	async skipStep() {
		await driverHelper.clickWhenClickable( this.driver, this.skipButtonLocator );
		await this.driver.switchTo().defaultContent();
	}
}
