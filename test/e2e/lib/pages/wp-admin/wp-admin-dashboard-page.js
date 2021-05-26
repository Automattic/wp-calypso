/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminDashboardPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		// driverHelper.refreshIfJNError( driver );
		super( driver, By.css( '#wpbody #wpbody-content' ), url );
	}

	static getUrl( url ) {
		url = url.replace( /^https?:\/\//, '' ).replace( /\/wp-admin/, '' );
		return `https://${ url }/wp-admin`;
	}

	static async refreshIfJNError( driver ) {
		return await driverHelper.refreshIfJNError( driver );
	}
}
