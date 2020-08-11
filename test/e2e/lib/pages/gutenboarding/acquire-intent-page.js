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
	}

	async enterSiteTitle( siteTitle ) {
		const siteTitleSelector = By.css( '.acquire-intent-text-input__input' );
		return await driverHelper.setWhenSettable( this.driver, siteTitleSelector, siteTitle );
	}

	async goToNextStep() {
		const nextButtonSelector = By.css( '.acquire-intent__question-skip.is-primary' );
		return await driverHelper.clickWhenClickable( this.driver, nextButtonSelector );
	}

	async skipStep() {
		const skipButtonSelector = By.css( '.acquire-intent__question-skip' );
		return await driverHelper.clickWhenClickable( this.driver, skipButtonSelector );
	}
}
