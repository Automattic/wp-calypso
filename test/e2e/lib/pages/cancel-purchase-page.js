/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class CancelPurchasePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.purchases__cancel.main' ) );
		this.cancelButtonLocator = By.css( 'button.cancel-purchase__button' );
	}

	async chooseCancelPlanAndDomain() {
		// Choose both plan and domain option
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'input[name="cancel_bundled_domain_false"]' )
		);
		// Agree to cancelling domain
		await driverHelper.setCheckbox( this.driver, By.css( 'input[type="checkbox"]' ) );
	}

	async clickCancelPurchase() {
		return await driverHelper.clickWhenClickable( this.driver, this.cancelButtonLocator );
	}

	async completeCancellationSurvey() {
		const e2eReason = 'e2e testing';
		const dialogClass = '.cancel-purchase-form__dialog';
		const buttonDialogClass = '.dialog__action-buttons';
		const nextButtonLocator = By.css( `${ buttonDialogClass } button[data-e2e-button="next"]` );
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `${ dialogClass } input[value="anotherReasonOne"]` )
		);
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( `${ dialogClass } input[name="anotherReasonOneInput"]` ),
			e2eReason
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `${ dialogClass } input[value="anotherReasonTwo"]` )
		);
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( `${ dialogClass } input[name="anotherReasonTwoInput"]` ),
			e2eReason
		);
		await driverHelper.clickWhenClickable( this.driver, nextButtonLocator );
		// Happychat Support can sometimes appear
		await driverHelper.clickIfPresent( this.driver, nextButtonLocator );
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( `${ dialogClass } textarea[name="improvementInput"]` ),
			e2eReason
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `${ buttonDialogClass } button[data-e2e-button="cancel"]` )
		);
	}

	async completeThemeCancellation() {
		const buttonDialogClass = '.dialog__action-buttons';
		const cancelButtonLocator = By.css( `${ buttonDialogClass } button[data-e2e-button="cancel"]` );
		return await driverHelper.clickWhenClickable( this.driver, cancelButtonLocator );
	}
}
