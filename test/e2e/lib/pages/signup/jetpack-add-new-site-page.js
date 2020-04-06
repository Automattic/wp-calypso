/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as dataHelper from '../../data-helper';
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';
import * as driverManager from '../../driver-manager';

const screenSize = driverManager.currentScreenSize();

export default class JetpackAddNewSitePage extends AsyncBaseContainer {
	constructor( driver, url = dataHelper.getCalypsoURL( 'jetpack/new', 'ref=calypso-selector' ) ) {
		super( driver, By.css( '.jetpack-new-site__main' ), url );
	}

	async _postInit() {
		await this.setABTestControlGroupsInLocalStorage();
		return await this.driver.navigate().refresh();
	}

	async createNewWordPressDotComSite() {
		const wpComButtonSelector =
			screenSize === 'mobile'
				? By.css( '.jetpack-new-site__mobile-wpcom-site a.button' )
				: By.css( '.jetpack-new-site__wpcom-site a.button' );
		return await driverHelper.clickWhenClickable( this.driver, wpComButtonSelector );
	}
}
