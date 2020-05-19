/**
 * External dependencies
 */
import { By, Key } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';
import AsyncBaseContainer from '../async-base-container';

export default class AddNewSitePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-new-site__header-title' ) );
	}

	async addSiteUrl( url ) {
		let urlInputSelector = By.css( '.jetpack-new-site__jetpack-site #siteUrl' );
		let confirmButtonSelector = By.css(
			'.jetpack-new-site__jetpack-site .jetpack-connect__connect-button'
		);

		if ( driverManager.currentScreenSize() === 'mobile' ) {
			urlInputSelector = By.css( '.jetpack-new-site__mobile-jetpack-site #siteUrl' );
			confirmButtonSelector = By.css(
				'.jetpack-new-site__mobile-jetpack-site .jetpack-connect__connect-button'
			);
		}

		// Set when settable doesn't work because of https://github.com/Automattic/wp-calypso/issues/24193
		this.driver.findElement( urlInputSelector ).then( ( webElement ) => {
			this.driver.executeScript( `return arguments[0].value='${ url }';`, webElement );
		} );
		await this.driver.findElement( urlInputSelector ).sendKeys( Key.SPACE );

		return await driverHelper.clickWhenClickable(
			this.driver,
			confirmButtonSelector,
			this.explicitWaitMS
		);
	}
}
