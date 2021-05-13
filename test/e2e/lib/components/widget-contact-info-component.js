/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container.js';

export default class WidgetContactInfoComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.widget_contact_info' ) );
	}

	async getName() {
		return await this.driver
			.findElement( By.css( '.widget_contact_info h2.widget-title' ) )
			.getText();
	}

	async getAddress() {
		return await this.driver
			.findElement( By.css( '.widget_contact_info div.confit-address a' ) )
			.getText();
	}
}
