import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container.js';

export default class ViewBlogPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.content-area' ), url );
		this.trampolineLocator = By.css( '#trampoline #trampoline-text' );
	}
}
