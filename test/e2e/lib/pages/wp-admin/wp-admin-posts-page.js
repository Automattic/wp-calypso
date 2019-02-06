/** @format */

import { By } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminPostsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.posts' ) );
	}

	async viewFirstPost() {
		const viewAnchor = By.css( '.status-publish .row-actions .view a' );
		const postPage = By.css( '#page' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, viewAnchor );
		await driverHelper.followLinkWhenFollowable( this.driver, viewAnchor );
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, postPage );
	}

	async trashedSuccessNoticeDisplayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( 'div.notice a[href*=untrash]' )
		);
	}
}
