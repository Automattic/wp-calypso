import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class JetpackConnectSiteTypePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-connect__step .site-type__wrapper' ) );
	}

	async selectSiteType( type ) {
		const siteTypeSelector = By.css( `button[data-e2e-title='${ type }']` );
		return await driverHelper.clickWhenClickable( this.driver, siteTypeSelector );
	}
}
