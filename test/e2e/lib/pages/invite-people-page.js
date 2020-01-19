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

import * as DriverHelper from '../driver-helper.js';

export default class InvitePeoplePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'fieldset#role' ) );
	}

	async inviteNewUser( email, role, message = '' ) {
		if ( role === 'viewer' ) {
			role = 'follower'; //the select input option uses follower for viewer
		}

		const roleSelector = By.css( `fieldset#role input[value=${ role }]` );

		await DriverHelper.setWhenSettable( this.driver, By.css( 'input.token-field__input' ), email );
		await DriverHelper.waitTillPresentAndDisplayed( this.driver, roleSelector );
		await DriverHelper.clickWhenClickable( this.driver, roleSelector );
		await DriverHelper.setCheckbox( this.driver, roleSelector );
		await DriverHelper.setWhenSettable( this.driver, By.css( '#message' ), message );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.button.is-primary:not([disabled])' )
		);
	}

	async backToPeopleMenu() {
		const navbarComponent = await NavBarComponent.Expect( this.driver );
		await navbarComponent.clickMySites();

		const sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await sideBarComponent.selectPeople();
	}
}
