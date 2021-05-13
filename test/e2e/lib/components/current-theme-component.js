/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

export default class CurrentThemeComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.current-theme' ) );
	}

	async getThemeName() {
		return await this.driver.findElement( By.css( '.current-theme__name' ) ).getText();
	}
}
