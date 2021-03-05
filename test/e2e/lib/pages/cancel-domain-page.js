/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';
import NoticesComponent from '../components/notices-component';

const by = webdriver.By;

export default class CancelDomainPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.confirm-cancel-domain.main' ) );
		this.confirmButtonSelector = by.css( '.confirm-cancel-domain .button.is-primary' );
	}

	async completeSurveyAndConfirm() {
		await this.driver.sleep( 2000 ); // since this is in after block, wait before open survey
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.confirm-cancel-domain__reasons-dropdown' )
		);
		await driverHelper.clickWhenClickable( this.driver, by.css( 'option[value="other"]' ) );
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.confirm-cancel-domain__reason-details' ),
			'e2e testing'
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.confirm-cancel-domain__confirm-container input[type="checkbox"]' )
		);
		await driverHelper.clickWhenClickable( this.driver, this.confirmButtonSelector );
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		return await noticesComponent.isSuccessNoticeDisplayed(); // TODO: Check when signup test is enabled again
	}

	async waitToDisappear() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			this.confirmButtonSelector,
			this.explicitWaitMS * 3
		);
	}
}
