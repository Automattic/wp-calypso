/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class PostAreaComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'article.post' ) );
	}

	async getPostHTML() {
		const postLocator = By.css( '.post .entry-content' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, postLocator );
		return await this.driver.findElement( postLocator ).getAttribute( 'innerHTML' );
	}
}
