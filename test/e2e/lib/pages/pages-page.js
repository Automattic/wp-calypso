/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper';

export default class PagesPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#pages' ) );
	}

	async waitForPages() {
		const driver = this.driver;
		const resultsLoadingLocator = By.css( '.pages__page-list .is-placeholder:not(.page)' );
		return await driverHelper.waitUntilElementNotLocated( driver, resultsLoadingLocator );
	}

	async editPageWithTitle( title ) {
		const pageTitleLocator = By.linkText( `${ title }` );
		return await driverHelper.clickWhenClickable( this.driver, pageTitleLocator );
	}

	async selectAddNewPage() {
		const startAPageButtonSelector = 'a.empty-content__action'; // When there are no pages
		const addNewPageButtonSelector = 'a.pages__add-page'; // When there are any pages

		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `${ startAPageButtonSelector }, ${ addNewPageButtonSelector }` )
		);
	}
}
