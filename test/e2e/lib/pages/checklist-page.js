/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class ChecklistPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.checklist.main' ), url );
		this.headerSelector = By.css( '.checklist.main .formatted-header__title' );
		this.subheaderSelector = By.css( '.checklist.main .formatted-header__subtitle' );
	}

	async headerExists() {
		return await driverHelper.isElementPresent( this.driver, this.headerSelector );
	}

	async subheaderExists() {
		return await driverHelper.isElementPresent( this.driver, this.subheaderSelector );
	}
}
