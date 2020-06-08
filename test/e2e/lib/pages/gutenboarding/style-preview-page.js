/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class StylePreviewPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.style-preview' ) );
	}

	async continue() {
		const continueButton = By.css(
			this.screenSize === 'MOBILE'
				? '.bottom-bar-mobile__continue-button'
				: '.style-preview__actions-continue-button'
		);
		await driverHelper.clickWhenClickable( this.driver, continueButton );
	}
}
