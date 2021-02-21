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
		const resultsLoadingSelector = By.css( '.pages__page-list .is-placeholder:not(.page)' );
		return await driver.wait(
			function () {
				return driverHelper
					.isElementPresent( driver, resultsLoadingSelector )
					.then( function ( present ) {
						return ! present;
					} );
			},
			this.explicitWaitMS,
			'The page results loading element was still present when it should have disappeared by now.'
		);
	}

	async editPageWithTitle( title ) {
		const pageTitleSelector = By.linkText( `${ title }` );
		return await driverHelper.clickWhenClickable( this.driver, pageTitleSelector );
	}

	async selectAddNewPage() {
		const addPageSelector = By.css( '.pages__add-page' ); // Add button when there are pages
		const startPageSelector = By.css( '.empty-content__action' ); // Add button when there are no pages

		if (
			await driverHelper.isEventuallyPresentAndDisplayed(
				this.driver,
				addPageSelector,
				this.explicitWaitMS / 5
			)
		) {
			return await driverHelper.clickWhenClickable( this.driver, addPageSelector );
		} else if (
			await driverHelper.isEventuallyPresentAndDisplayed(
				this.driver,
				startPageSelector,
				this.explicitWaitMS / 5
			)
		) {
			return await driverHelper.clickWhenClickable( this.driver, startPageSelector );
		}
	}
}
