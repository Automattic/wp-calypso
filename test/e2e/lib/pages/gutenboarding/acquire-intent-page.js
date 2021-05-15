/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class AcquireIntentPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.acquire-intent' ) );
		this.nextButtonLocator = By.css( '.action-buttons__next' );
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
		const skipButtonLocator = By.css( '.action-buttons__skip' );
		await driverHelper.clickWhenClickable( this.driver, skipButtonLocator );
		await this.driver.switchTo().defaultContent();
	}
}
