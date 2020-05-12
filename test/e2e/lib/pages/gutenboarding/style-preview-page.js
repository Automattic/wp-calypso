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

	async continueToCreateSite() {
		const continueButton = By.css(
			'.style-preview__actions-continue-button, .bottom-bar-mobile__continue-button'
		);
		return await driverHelper.clickWhenClickable( this.driver, continueButton );
	}
}
