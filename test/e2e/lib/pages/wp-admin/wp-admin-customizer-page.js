/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminCustomizerPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wp-customizer' ) );
	}
}
