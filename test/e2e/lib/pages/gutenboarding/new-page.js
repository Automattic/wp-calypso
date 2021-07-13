import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as dataHelper from '../../data-helper';
import * as driverHelper from '../../driver-helper';

export default class NewPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = NewPage.getGutenboardingURL();
		}
		super( driver, By.css( '.is-section-gutenboarding' ), url );
	}

	static getGutenboardingURL( { locale = 'en', query = '' } = {} ) {
		let route = 'new';
		const queryStrings = [];

		if ( locale !== 'en' ) {
			route += '/' + locale;
		}

		if ( query !== '' ) {
			queryStrings.push( query );
		}

		return dataHelper.getCalypsoURL( route, queryStrings );
	}

	async isOnboardingBlockDisplayed() {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( '[data-type="automattic/onboarding"]' )
		);
	}
}
