/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

export default class PrivateSiteLoginPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.private-login' ), url );
	}
}
