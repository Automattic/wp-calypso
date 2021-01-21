/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper.js';

export default class StoreDashboardPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.woocommerce .dashboard.main' ) );
		this.storeMoveNoticeCardSelector = by.css( '.dashboard__store-move-notice' );
	}

	async storeMoveNoticeCardDisplayed() {
		return await driverHelper.isElementPresent( this.driver, this.storeMoveNoticeCardSelector );
	}
}
