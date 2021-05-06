/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as dataHelper from '../../data-helper';

export default class DesignLocatorPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.designs' ) );
		this.freeOptionLocator = By.css( 'button[data-e2e-button="freeOption"]' );
		this.paidOptionLocator = By.css( 'button[data-e2e-button="paidOption"]' );
	}

	async selectFreeDesign() {
		const freeOptions = await this.driver.findElements( this.freeOptionLocator );
		await freeOptions[ dataHelper.getRandomInt( 0, freeOptions.length - 1 ) ].click();
	}

	async selectPaidDesign() {
		const paidOptions = await this.driver.findElements( this.paidOptionLocator );
		await paidOptions[ dataHelper.getRandomInt( 0, paidOptions.length - 1 ) ].click();
	}
}
