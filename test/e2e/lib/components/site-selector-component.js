/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * External dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class SiteSelectorComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-selector-modal' ) );
		this.firstSiteSelector = By.css( 'div.site-selector-modal div.site-selector__sites a' );
	}

	async ok() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog .button.is-primary' ),
			this.explicitWaitMS
		);
	}

	async selectFirstSite() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.sites-dropdown' ),
			this.explicitWaitMS
		);
		const element = await this.driver.findElement( this.firstSiteSelector );
		this.selectedSiteDomain = await element.findElement( By.css( '.site__domain' ) ).getText();
		return await element.click();
	}
}
