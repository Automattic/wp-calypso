/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as dataHelper from '../../data-helper';

export default class DesignSelectorPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.designs' ) );
		this.freeOptionSelector = By.css( 'button[data-e2e-button="freeOption"]' );
		this.paidOptionSelector = By.css( 'button[data-e2e-button="paidOption"]' );
	}

	async selectFreeDesign() {
		const freeOptions = await this.driver.findElements( this.freeOptionSelector );
		await freeOptions[ dataHelper.getRandomInt( 0, freeOptions.length - 1 ) ].click();
	}

	async selectPaidDesign() {
		const paidOptions = await this.driver.findElements( this.paidOptionSelector );
		await paidOptions[ dataHelper.getRandomInt( 0, paidOptions.length - 1 ) ].click();
	}
}
