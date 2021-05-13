/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';

export default class SiteTitleTaglinePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.steps__main[data-e2e-type="site-title"]' ) );
	}

	async enterTitle( siteTitle ) {
		return await driverHelper.setWhenSettable( this.driver, By.css( 'input#blogname' ), siteTitle );
	}

	async enterTagline( siteTagline ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( 'input#blogdescription' ),
			siteTagline
		);
	}

	async selectContinue() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( 'button.is-primary' ) );
	}
}
