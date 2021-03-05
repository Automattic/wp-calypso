/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

const by = webdriver.By;

export default class CancelPurchasePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.purchases__cancel.main' ) );
		this.cancelButtonSelector = by.css( 'button.cancel-purchase__button' );
	}

	async chooseCancelPlanAndDomain() {
		// Choose both plan and domain option
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'input[name="cancel_bundled_domain_false"]' )
		);
		// Agree to cancelling domain
		return await driverHelper.setCheckbox( this.driver, by.css( 'input[type="checkbox"]' ) );
	}

	async clickCancelPurchase() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.cancelButtonSelector );
		return await driverHelper.clickWhenClickable( this.driver, this.cancelButtonSelector );
	}

	async completeCancellationSurvey() {
		const e2eReason = 'e2e testing';
		const dialogClass = '.cancel-purchase-form__dialog';
		const buttonDialogClass = '.dialog__action-buttons';
		const nextButtonSelector = by.css( `${ buttonDialogClass } button[data-e2e-button="next"]` );
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( `${ dialogClass } input[value="anotherReasonOne"]` )
		);
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( `${ dialogClass } input[name="anotherReasonOneInput"]` ),
			e2eReason
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( `${ dialogClass } input[value="anotherReasonTwo"]` )
		);
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( `${ dialogClass } input[name="anotherReasonTwoInput"]` ),
			e2eReason
		);
		await driverHelper.clickWhenClickable( this.driver, nextButtonSelector );
		// Happychat Support can sometimes appear
		await driverHelper.clickIfPresent( this.driver, nextButtonSelector, 1 );
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( `${ dialogClass } textarea[name="improvementInput"]` ),
			e2eReason
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( `${ buttonDialogClass } button[data-e2e-button="cancel"]` )
		);
	}

	async completeThemeCancellation() {
		const buttonDialogClass = '.dialog__action-buttons';
		const cancelButtonSelector = by.css(
			`${ buttonDialogClass } button[data-e2e-button="cancel"]`
		);
		return await driverHelper.clickWhenClickable( this.driver, cancelButtonSelector );
	}
}
