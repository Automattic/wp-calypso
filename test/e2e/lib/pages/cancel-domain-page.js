/** @format */

import webdriver from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class CancelDomainPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.confirm-cancel-domain.main' ) );
		this.confirmButtonSelector = by.css( 'button[type="submit"]' );
	}

	async completeSurveyAndConfirm() {
		await this.driver.sleep( 2000 ); // since this is in after block, wait before open survey
		await driverHelper.clickWhenClickable( this.driver, by.css( '.select-dropdown__header' ) );
		await driverHelper.clickWhenClickable( this.driver, by.css( '.select-dropdown__item' ) );
		await driverHelper.setCheckbox(
			this.driver,
			by.css( '.confirm-cancel-domain__confirm-container input[type="checkbox"]' )
		);
		await driverHelper.verifyTextPresent(
			this.driver,
			this.confirmButtonSelector,
			'Cancel Anyway'
		);
		await driverHelper.clickWhenClickable( this.driver, this.confirmButtonSelector );
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.notice.is-success.is-dismissable' ),
			this.explicitWaitMS * 3
		);
	}

	async waitToDisappear() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			this.confirmButtonSelector,
			this.explicitWaitMS * 3
		);
	}
}
