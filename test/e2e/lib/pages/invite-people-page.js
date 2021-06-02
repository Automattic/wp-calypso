/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import SidebarComponent from '../components/sidebar-component.js';
import NavBarComponent from '../components/nav-bar-component.js';

import * as driverHelper from '../driver-helper.js';

export default class InvitePeoplePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'fieldset#role' ) );
	}

	async inviteNewUser( email, role, message = '' ) {
		if ( role === 'viewer' ) {
			role = 'follower'; // The select input option uses 'follower' for 'viewer'
		}

		const emailFieldLocator = By.css( 'input#usernamesOrEmails' );
		const roleLocator = By.css( `input.role-select__role-radio[value=${ role }]` );
		const messageFieldLocator = By.css( 'textarea#message' );
		const submitButtonLocator = By.css( '.invite-people button[type="submit"]' );

		await driverHelper.setWhenSettable( this.driver, emailFieldLocator, email );
		await driverHelper.clickWhenClickable( this.driver, roleLocator );
		if ( this.screenSize === 'mobile' ) {
			/**
			 * On mobile viewport, the first click seems to only bring focus to the
			 * fieldset so we need to click again. This is specific to WebDriver and
			 * doesn't happen when testing manually.
			 */
			await driverHelper.clickWhenClickable( this.driver, roleLocator );
		}
		await driverHelper.setWhenSettable( this.driver, messageFieldLocator, message );
		await driverHelper.clickWhenClickable( this.driver, submitButtonLocator );
	}

	async backToPeopleMenu() {
		const navbarComponent = await NavBarComponent.Expect( this.driver );
		await navbarComponent.clickMySites();

		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await sideBarComponent.selectPeople();
	}
}
