/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper.js';
import * as driverManager from '../../driver-manager.js';

import AsyncBaseContainer from '../../async-base-container';

const screenSize = driverManager.currentScreenSize();

export default class TrafficPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.settings-traffic' ) );
	}

	async openTrafficTab() {
		if ( screenSize === 'mobile' ) {
			await driverHelper.clickWhenClickable( this.driver, By.css( '.section-nav__mobile-header' ) );
		}
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tab__link[href*="/marketing/traffic/"]' )
		);
	}

	async enterFrontPageMetaAndClickPreviewButton() {
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '#advanced_seo_front_page_description' ),
			'test text'
		);
		await driverHelper.clickWhenClickable( this.driver, By.css( '.seo-settings__preview-button' ) );
	}
}
