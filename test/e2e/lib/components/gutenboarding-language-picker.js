/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

export default class GutenboardingLanguagePickerComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'a[href*="language-modal"]' ) );
	}

	async switchLanguage( languageSlug ) {
		await driverHelper.clickWhenClickable( this.driver, this.expectedElementSelector );
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.language-picker-component__language-button [lang="${ languageSlug }"]` )
		);
	}
}
