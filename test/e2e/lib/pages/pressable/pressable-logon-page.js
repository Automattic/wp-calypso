/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class PressableLogonPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = 'https://my.pressable.com/login';
		}
		super( driver, By.css( 'form#new_user' ), url );
	}

	async loginWithWP() {
		const wpButtonSelector = By.css( 'div .btn-wordpress' );
		return await driverHelper.clickWhenClickable( this.driver, wpButtonSelector );
	}
}
