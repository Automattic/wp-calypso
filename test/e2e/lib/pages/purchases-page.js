/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class PurchasesPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'main.purchases-list' ) );
	}

	async _postInit() {
		return await this._waitForPurchases();
	}

	async selectBusinessPlan() {
		return await this._selectPlan( 'business' );
	}

	async selectPremiumPlan() {
		return await this._selectPlan( 'premium' );
	}

	async selectPersonalPlan() {
		return await this._selectPlan( 'personal' );
	}

	async selectPremiumPlanOnConnectedSite() {
		return await this._selectPlanOnConnectedSite();
	}

	async selectTheme() {
		await this._waitForPurchases();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.purchase-item svg.gridicons-themes' )
		);
	}

	async dismissGuidedTour() {
		return await driverHelper.clickIfPresent(
			this.driver,
			By.css( '.guided-tours__choice-button-row button:not(.is-primary)' )
		);
	}

	async _waitForPurchases() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.is-placeholder' ),
			this.explicitWaitMS * 3
		);
	}

	async _selectPlan( planName ) {
		await this._waitForPurchases();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `a.purchase-item img.is-${ planName }-plan` )
		);
	}

	async _selectPlanOnConnectedSite() {
		await this._waitForPurchases();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `a.purchase-item[data-e2e-connected-site=true] svg` )
		);
	}
}
