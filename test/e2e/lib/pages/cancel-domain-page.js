/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';
import NoticesComponent from '../components/notices-component';

export default class CancelDomainPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.confirm-cancel-domain.main' ) );
		this.confirmButtonLocator = By.css( '.confirm-cancel-domain .button.is-primary' );
	}

	async completeSurveyAndConfirm() {
		await this.driver.sleep( 2000 ); // since this is in after block, wait before open survey
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.confirm-cancel-domain__reasons-dropdown' )
		);
		await driverHelper.clickWhenClickable( this.driver, By.css( 'option[value="other"]' ) );
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.confirm-cancel-domain__reason-details' ),
			'e2e testing'
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.confirm-cancel-domain__confirm-container input[type="checkbox"]' )
		);
		await driverHelper.clickWhenClickable( this.driver, this.confirmButtonLocator );
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		return await noticesComponent.isSuccessNoticeDisplayed(); // TODO: Check when signup test is enabled again
	}

	async waitToDisappear() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			this.confirmButtonLocator,
			this.explicitWaitMS * 3
		);
	}
}
