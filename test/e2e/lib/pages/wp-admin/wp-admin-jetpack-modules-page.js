/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminJetpackModulesPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.jetpack-modules-list-table-form' ), url );
	}

	static getPageURL( url ) {
		return url + '/wp-admin/admin.php?page=jetpack_modules';
	}

	async activateMarkdown() {
		const markdownActivateLinkSelector = By.css( '#markdown .activate a' );
		const isNotActive = await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			markdownActivateLinkSelector,
			5000
		);
		if ( ! isNotActive ) {
			return true;
		}
		return await driverHelper.followLinkWhenFollowable( this.driver, markdownActivateLinkSelector );
	}
}
