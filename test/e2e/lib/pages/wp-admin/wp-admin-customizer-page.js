/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminCustomizerPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wp-customizer' ) );
	}

	static async refreshIfJNError( driver ) {
		return await driverHelper.refreshIfJNError( driver );
	}
}
