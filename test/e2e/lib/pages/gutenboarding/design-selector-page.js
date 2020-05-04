/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class DesignSelectorPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.design-selector' ) );
		this.designOptionClassName = '.design-selector__design-option';
	}

	async getDesignOptionsCount() {
		const designGridSelector = By.css( '.design-selector__grid' );
		const designOptionSelector = By.css( this.designOptionClassName );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, designGridSelector );
		return await driverHelper.getElementCount( this.driver, designOptionSelector );
	}

	async selectDesign( position ) {
		const chosenDesignOptionSelector = By.css(
			`${ this.designOptionClassName }:nth-child(${ position })`
		);
		return await driverHelper.clickWhenClickable( this.driver, chosenDesignOptionSelector );
	}
}
