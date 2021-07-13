import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';

export default class CustomerHomePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.customer-home__layout' ) );
	}
}
