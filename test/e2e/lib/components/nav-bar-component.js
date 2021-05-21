/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class NavBarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.masterbar' ) );
	}
	async clickCreateNewPost( { siteURL = null } = {} ) {
		const postButtonLocator = by.css( 'a.masterbar__item-new' );
		await driverHelper.clickWhenClickable( this.driver, postButtonLocator );
		await this.dismissComponentPopover();
		if ( siteURL !== null ) {
			const siteDomainLocator = driverHelper.createTextLocator(
				by.css( '.site__domain' ),
				siteURL
			);
			await driverHelper.clickWhenClickable( this.driver, siteDomainLocator );
		}
	}
	async dismissComponentPopover() {
		const popoverLocator = by.css( '.components-popover__content' );
		const dismissPopoverLocator = by.css( '.nux-dot-tip__disable' );

		if ( await driverHelper.isElementLocated( this.driver, popoverLocator ) ) {
			await driverHelper.clickWhenClickable( dismissPopoverLocator );
		}
	}
	async clickProfileLink() {
		const profileLocator = by.css( 'a.masterbar__item-me' );
		return await driverHelper.clickWhenClickable( this.driver, profileLocator );
	}
	async clickMySites() {
		const mySitesLocator = by.css( 'header.masterbar a.masterbar__item' );
		await driverHelper.clickWhenClickable( this.driver, mySitesLocator );
	}
	async hasUnreadNotifications() {
		return await this.driver
			.findElement( by.css( '.masterbar__item-notifications' ) )
			.getAttribute( 'class' )
			.then( ( classNames ) => {
				return classNames.includes( 'has-unread' );
			} );
	}
	async openNotifications() {
		const driver = this.driver;
		const notificationsLocator = by.css( '.masterbar__item-notifications' );
		const classNames = await driver.findElement( notificationsLocator ).getAttribute( 'class' );
		if ( classNames.includes( 'is-active' ) === false ) {
			return await driverHelper.clickWhenClickable( driver, notificationsLocator );
		}
		await driver.sleep( 400 ); // Wait for menu animation to complete
	}
	async openNotificationsShortcut() {
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			by.css( '.masterbar__notifications' )
		);
		return await this.driver.findElement( by.css( 'body' ) ).sendKeys( 'n' );
	}
	async confirmNotificationsOpen() {
		const locator = by.css( '.wpnt-open' );
		return await driverHelper.isElementEventuallyLocatedAndVisible( this.driver, locator );
	}
	async dismissGuidedTours() {
		const self = this;
		const guidedToursDialogLocator = by.css( 'div.guided-tours__step-first' );
		const guidedToursDismissButtonLocator = by.css(
			'div.guided-tours__step-first button:not(.is-primary)'
		);
		const present = await driverHelper.isElementLocated( self.driver, guidedToursDialogLocator );
		if ( present === true ) {
			return await driverHelper.clickWhenClickable( self.driver, guidedToursDismissButtonLocator );
		}
	}
}
