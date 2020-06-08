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
		super( driver, By.css( '.design-selector' ) );
		this.designOptionClassName = '.design-selector__design-option';
		this.designGridSelectorFree = '.design-selector__grid > button[data-e2e-button="freeOption"]';
	}

	async selectFreeDesign() {
		const freeOptions = await this.driver.findElements(
			By.xpath( '//button[@data-e2e-button="freeOption"]' )
		);
		return freeOptions[ dataHelper.getRandomInt( 0, freeOptions.length - 1 ) ].click();
	}

	async selectPaidDesign() {
		const paidOptions = await this.driver.findElements(
			By.xpath( '//button[@data-e2e-button="paidOption"]' )
		);
		return paidOptions[ dataHelper.getRandomInt( 0, paidOptions.length - 1 ) ].click();
	}
}
