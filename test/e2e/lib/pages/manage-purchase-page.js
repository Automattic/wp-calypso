/** @format */

/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';
import NoticesComponent from '../components/notices-component';

export default class ManagePurchasePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.manage-purchase.main' ) );
	}

	async _postInit() {
		return await driverHelper.waitTillNotPresent( this.driver, by.css( '.is-placeholder' ) );
	}

	async domainDisplayed() {
		return await this.driver.findElement( by.css( '.manage-purchase__title' ) ).getText();
	}

	async chooseCancelAndRefund() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.manage-purchase a[href$="cancel"]' )
		);
	}

	async chooseRenewNow() {
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		return await noticesComponent.isNoticeDisplayed( true );
	}
}
