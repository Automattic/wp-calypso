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
		const fontOptions = await this.driver.findElements(
			By.css( 'button.style-preview__font-option' )
		);

		if ( fontIndex === undefined ) {
			fontIndex = dataHelper.getRandomInt( 0, fontOptions.length - 1 );
		}

		fontOptions[ fontIndex ].click();
	}
}
