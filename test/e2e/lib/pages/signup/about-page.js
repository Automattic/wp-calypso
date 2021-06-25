/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

export default class AboutPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.about__wrapper' ) );
	}

	async submitForm() {
		const submitLocator = By.css( '.about__submit-wrapper button.is-primary' );
		return await driverHelper.clickWhenClickable( this.driver, submitLocator );
	}

	async enterSiteDetails(
		siteTitle,
		siteTopic,
		{ showcase = false, share = false, sell = false, educate = false, promote = false } = {}
	) {
		// The suggestion overlay of #siteTopic can prevent the site goals from getting clicked.
		// To avoid that problem, we're going to input the site topic first.
		await driverHelper.setWhenSettable( this.driver, By.css( '#siteTopic' ), siteTopic );
		await driverHelper.setWhenSettable( this.driver, By.css( '#siteTitle' ), siteTitle );

		async function setOption( optionSelector ) {
			await driverHelper.setCheckbox( this.driver, By.css( optionSelector ) );
		}

		if ( showcase === true ) {
			await setOption( '#showcase' );
		}
		if ( share === true ) {
			await setOption( '#share' );
		}
		if ( sell === true ) {
			await setOption( '#sell' );
		}
		if ( educate === true ) {
			await setOption( '#educate' );
		}
		if ( promote === true ) {
			await setOption( '#promote' );
		}
	}
}
