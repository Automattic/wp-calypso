/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';
import * as dataHelper from '../../data-helper';

export default class StylePreviewPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.style-preview' ) );
	}

	async continue() {
		const continueButton = By.css( '.action-buttons__next' );
		await driverHelper.clickWhenClickable( this.driver, continueButton );
	}

	async selectFontPairing( fontIndex ) {
		let fontOptions;
		if ( this.screenSize === 'mobile' ) {
			const mobileExpandFontOptionsButton = By.css(
				'.style-preview__font-options-mobile .style-preview__font-option-select'
			);
			await driverHelper.clickWhenClickable( this.driver, mobileExpandFontOptionsButton );
			fontOptions = await this.driver.findElements(
				By.css( '.style-preview__font-options-mobile button.style-preview__font-option' )
			);
		} else {
			fontOptions = await this.driver.findElements(
				By.css( '.style-preview__font-options-desktop button.style-preview__font-option' )
			);
		}

		if ( fontIndex === undefined ) {
			fontIndex = dataHelper.getRandomInt( 0, fontOptions.length - 1 );
		}

		await fontOptions[ fontIndex ].click();
	}
}
