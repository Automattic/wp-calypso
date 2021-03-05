/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

export default class LoggedOutMasterbarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.masterbar__login-links,.masterbar .nav,#wpcom-home .masterbar' ) );
	}
}
