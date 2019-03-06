/** @format */

import { By as by } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminCustomizerPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.wp-customizer' ) );
	}

	static async refreshIfJNError( driver ) {
		return await driverHelper.refreshIfJNError( driver );
	}
}
