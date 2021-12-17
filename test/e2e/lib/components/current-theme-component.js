import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container.js';

export default class CurrentThemeComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.current-theme' ) );
	}

	async getThemeName() {
		return await this.driver.findElement( By.css( '.current-theme__name' ) ).getText();
	}
}
