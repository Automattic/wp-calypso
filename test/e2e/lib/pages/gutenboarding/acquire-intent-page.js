/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';
import * as dataHelper from '../../data-helper';

export default class AcquireIntentPage extends AsyncBaseContainer {
	constructor( driver, url = dataHelper.getCalypsoURL( 'new' ) ) {
		super( driver, By.css( '.acquire-intent' ), url );
	}

	async enterSiteTitle( siteTitle ) {
		const siteTitleSelector = By.css( '.acquire-intent-text-input__input' );
		return await driverHelper.setWhenSettable( this.driver, siteTitleSelector, siteTitle );
	}

	async goToNextStep() {
		const nextButtonSelector = By.css( '.action-buttons__next' );
		return await driverHelper.clickWhenClickable( this.driver, nextButtonSelector );
	}

	async skipStep() {
		const skipButtonSelector = By.css( '.action-buttons__skip' );
		return await driverHelper.clickWhenClickable( this.driver, skipButtonSelector );
	}
}
