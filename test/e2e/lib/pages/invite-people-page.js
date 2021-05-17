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

		const emailFieldLocator = By.css( 'input.token-field__input' );
		const userRoleLocator = By.css( `fieldset#role input[value=${ role }]` );
		const messageFieldLocator = By.css( '#message' );
		const submitButtonLocator = By.css( '.invite-people button.button.is-primary' );

		await driverHelper.setWhenSettable( this.driver, emailFieldLocator, email );
		await driverHelper.clickWhenClickable( this.driver, userRoleLocator );
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
