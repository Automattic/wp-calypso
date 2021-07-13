import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';

export default class NotFoundPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'body.error404' ) );
	}
}
