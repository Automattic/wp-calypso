import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class JetpackConnectUserTypePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.user-type__connect-step' ) );
	}

	async selectUserType( userType ) {
		const userTypeSelector = By.css( `button[data-e2e-slug='${ userType }']` );
		return await driverHelper.clickWhenClickable( this.driver, userTypeSelector );
	}
}
