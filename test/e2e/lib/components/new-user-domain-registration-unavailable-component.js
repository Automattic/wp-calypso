/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

export default class NewUserRegistrationUnavailableComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.notice__text' ) );
	}
}
