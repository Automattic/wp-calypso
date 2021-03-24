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
		this.nextButtonSelector = By.css( '.action-buttons__next' );
		this.skipButtonSelector = By.css( '.action-buttons__skip' );
	}

	async enterSiteTitle( siteTitle ) {
		const siteTitleSelector = By.css( '.acquire-intent-text-input__input' );
		return await driverHelper.setWhenSettable( this.driver, siteTitleSelector, siteTitle, {
			pauseBetweenKeysMS: 10,
		} );
	}

	async goToNextStep() {
		return await driverHelper.clickWhenClickable( this.driver, this.nextButtonSelector );
	}

	async skipStep() {
		return await driverHelper.clickWhenClickable( this.driver, this.skipButtonSelector );
	}
}
