/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

/**
 * This class copies the functionality of nav-bar-component for pages
 * loaded outside the calypso context (eg simple-site-domain.wordpress.com)
 */
export default class NavBarWPAdminComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#wpadminbar' ) );
	}

	hasUnreadNotifications() {
		return this.driver
			.findElement( by.css( '.wp-admin-bar-notes .wpnt-loading' ) )
			.getAttribute( 'class' )
			.then( ( classNames ) => {
				return classNames.includes( 'wpn-unread' );
			} );
	}
	async openNotifications() {
		const driver = this.driver;
		const notificationsSelector = by.css( '#wp-admin-bar-notes' );
		const classNames = await driver.findElement( notificationsSelector ).getAttribute( 'class' );
		if ( classNames.includes( 'active' ) === false ) {
			await driverHelper.clickWhenClickable( driver, notificationsSelector );
			// await driver.sleep( 400 ); // Wait for menu animation to complete // todo suspect not required
		}
	}
	async openNotificationsShortcut() {
		await driverHelper.waitUntilLocatedAndVisible( this.driver, by.css( '#wp-admin-bar-notes' ) );
		return await this.driver.findElement( by.css( 'body' ) ).sendKeys( 'n' );
	}
	async confirmNotificationsOpen() {
		const selector = by.css( '.wpnt-stayopen' );
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}
}
