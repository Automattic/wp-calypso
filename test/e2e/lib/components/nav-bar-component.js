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
		const postButtonSelector = by.css( 'a.masterbar__item-new' );
		await driverHelper.clickWhenClickable( this.driver, postButtonSelector );
		await this.dismissComponentPopover();
		if ( siteURL !== null ) {
			return await driverHelper.selectElementByText(
				this.driver,
				by.css( '.site__domain' ),
				siteURL
			);
		}
	}
	async dismissComponentPopover() {
		const popoverSelector = by.css( '.components-popover__content' );
		const dismissPopoverSelector = by.css( '.nux-dot-tip__disable' );

		if ( await driverHelper.isElementPresent( this.driver, popoverSelector ) ) {
			await driverHelper.clickWhenClickable( dismissPopoverSelector );
		}
	}
	async clickProfileLink() {
		const profileSelector = by.css( 'a.masterbar__item-me' );
		return await driverHelper.clickWhenClickable( this.driver, profileSelector );
	}
	async clickMySites() {
		const mySitesSelector = by.css( 'header.masterbar a.masterbar__item' );
		await driverHelper.clickWhenClickable( this.driver, mySitesSelector );
		await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.sidebar__menu-wrapper' )
		);
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.is-group-sites' )
		);
	}
	hasUnreadNotifications() {
		return this.driver
			.findElement( by.css( '.masterbar__item-notifications' ) )
			.getAttribute( 'class' )
			.then( ( classNames ) => {
				return classNames.includes( 'has-unread' );
			} );
	}
	async openNotifications() {
		const driver = this.driver;
		const notificationsSelector = by.css( '.masterbar__item-notifications' );
		const classNames = await driver.findElement( notificationsSelector ).getAttribute( 'class' );
		if ( classNames.includes( 'is-active' ) === false ) {
			return driverHelper.clickWhenClickable( driver, notificationsSelector );
		}
	}
	async openNotificationsShortcut() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.masterbar__notifications' )
		);
		return await this.driver.findElement( by.css( 'body' ) ).sendKeys( 'n' );
	}
	async confirmNotificationsOpen() {
		const selector = by.css( '.wpnt-open' );
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}
	async dismissGuidedTours() {
		const self = this;
		const guidedToursDialogSelector = by.css( 'div.guided-tours__step-first' );
		const guidedToursDismissButtonSelector = by.css(
			'div.guided-tours__step-first button:not(.is-primary)'
		);
		const present = await driverHelper.isElementPresent( self.driver, guidedToursDialogSelector );
		if ( present === true ) {
			return await driverHelper.clickWhenClickable( self.driver, guidedToursDismissButtonSelector );
		}
	}
}
