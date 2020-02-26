/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper';

export default class GutenboardingPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = GutenboardingPage.getGutenboardingURL();
		}
		super( driver, by.css( '.is-section-gutenboarding' ), url );
	}

	static getGutenboardingURL() {
		// using forceWpCalypso flag because Gutenboarding is enabled only on wpcalypso
		return dataHelper.getCalypsoURL( 'gutenboarding', undefined, { forceWpCalypso: true } );
	}

	async waitForBlock() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.gutenboarding-block-list' )
		);
	}
}
