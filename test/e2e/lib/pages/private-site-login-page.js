import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container.js';

export default class PrivateSiteLoginPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.private-login' ), url );
	}
}
