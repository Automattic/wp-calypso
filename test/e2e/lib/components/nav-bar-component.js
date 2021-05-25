/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class NavBarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.masterbar' ) );
	}
	async clickCreateNewPost( { siteURL = null } = {} ) {
		const postButtonLocator = By.css( 'a.masterbar__item-new' );
		await driverHelper.clickWhenClickable( this.driver, postButtonLocator );
		await this.dismissComponentPopover();
		if ( siteURL !== null ) {
			const siteDomainLocator = driverHelper.createTextLocator(
				By.css( '.site__domain' ),
				siteURL
			);
			await driverHelper.clickWhenClickable( this.driver, siteDomainLocator );
		}
	}
	async dismissComponentPopover() {
		const popoverLocator = By.css( '.components-popover__content' );
		const dismissPopoverLocator = By.css( '.nux-dot-tip__disable' );

		if ( await driverHelper.isElementLocated( this.driver, popoverLocator ) ) {
			await driverHelper.clickWhenClickable( dismissPopoverLocator );
		}
	}
	async clickProfileLink() {
		const profileLocator = By.css( 'a.masterbar__item-me' );
		return await driverHelper.clickWhenClickable( this.driver, profileLocator );
	}
	async clickMySites() {
		const mySitesLocator = By.css( 'header.masterbar a.masterbar__item' );
		await driverHelper.clickWhenClickable( this.driver, mySitesLocator );
	}
	async hasUnreadNotifications() {
		return await this.driver
			.findElement( By.css( '.masterbar__item-notifications' ) )
			.getAttribute( 'class' )
			.then( ( classNames ) => {
				return classNames.includes( 'has-unread' );
			} );
	}
	async openNotifications() {
		const driver = this.driver;
		const notificationsLocator = By.css( '.masterbar__item-notifications' );
		const classNames = await driver.findElement( notificationsLocator ).getAttribute( 'class' );
		if ( classNames.includes( 'is-active' ) === false ) {
			return await driverHelper.clickWhenClickable( driver, notificationsLocator );
		}
		await driver.sleep( 400 ); // Wait for menu animation to complete
	}
	async openNotificationsShortcut() {
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.masterbar__notifications' )
		);
		return await this.driver.findElement( By.css( 'body' ) ).sendKeys( 'n' );
	}
	async isNotificationsTabOpen() {
		const locator = By.css( '.wpnt-open' );
		return await driverHelper.isElementEventuallyLocatedAndVisible( this.driver, locator );
	}
	async dismissGuidedTours() {
		const self = this;
		const guidedToursDialogLocator = By.css( 'div.guided-tours__step-first' );
		const guidedToursDismissButtonLocator = By.css(
			'div.guided-tours__step-first button:not(.is-primary)'
		);
		const present = await driverHelper.isElementLocated( self.driver, guidedToursDialogLocator );
		if ( present === true ) {
			return await driverHelper.clickWhenClickable( self.driver, guidedToursDismissButtonLocator );
		}
	}
}
