/** @format */

import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';

import SidebarComponent from '../components/sidebar-component.js';
import NavBarComponent from '../components/nav-bar-component.js';

import * as DriverHelper from '../driver-helper.js';

export default class InvitePeoplePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'select#role' ) );
	}

	async inviteNewUser( email, role, message = '' ) {
		if ( role === 'viewer' ) {
			role = 'follower'; //the select input option uses follower for viewer
		}

		const roleSelector = By.css( `select#role option[value=${ role }]` );

		await DriverHelper.setWhenSettable( this.driver, By.css( 'input.token-field__input' ), email );
		await DriverHelper.waitTillPresentAndDisplayed( this.driver, roleSelector );
		await DriverHelper.clickWhenClickable( this.driver, roleSelector );
		await DriverHelper.setWhenSettable( this.driver, By.css( '#message' ), message );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.button.is-primary:not([disabled])' )
		);
	}

	async inviteSent() {
		return await DriverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '.notice__text' )
		);
	}

	async backToPeopleMenu() {
		const navbarComponent = await NavBarComponent.Expect( this.driver );
		await navbarComponent.clickMySites();

		let sideBarComponent = await SidebarComponent.Expect( this.driver );
		return await sideBarComponent.selectPeople();
	}
}
