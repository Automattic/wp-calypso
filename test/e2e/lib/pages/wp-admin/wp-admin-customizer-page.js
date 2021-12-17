import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container.js';

export default class WPAdminCustomizerPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wp-customizer' ) );
	}
}
