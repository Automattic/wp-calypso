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
		const continueButton = By.css( '.action-buttons__next' );
		await driverHelper.clickWhenClickable( this.driver, continueButton );
	}
}
