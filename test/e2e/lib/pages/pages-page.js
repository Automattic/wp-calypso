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
		return await driver.wait(
			function () {
				return driverHelper
					.isElementLocated( driver, resultsLoadingLocator )
					.then( function ( present ) {
						return ! present;
					} );
			},
			this.explicitWaitMS,
			'The page results loading element was still present when it should have disappeared by now.'
		);
	}

	async editPageWithTitle( title ) {
		const pageTitleLocator = By.linkText( `${ title }` );
		return await driverHelper.clickWhenClickable( this.driver, pageTitleLocator );
	}

	async selectAddNewPage() {
		const addPageLocator = By.css( '.pages__add-page' ); // Add button when there are pages
		const startPageLocator = By.css( '.empty-content__action' ); // Add button when there are no pages

		if (
			await driverHelper.isElementEventuallyLocatedAndVisible(
				this.driver,
				addPageLocator,
				this.explicitWaitMS / 5
			)
		) {
			return await driverHelper.clickWhenClickable( this.driver, addPageLocator );
		} else if (
			await driverHelper.isElementEventuallyLocatedAndVisible(
				this.driver,
				startPageLocator,
				this.explicitWaitMS / 5
			)
		) {
			return await driverHelper.clickWhenClickable( this.driver, startPageLocator );
		}
	}
}
