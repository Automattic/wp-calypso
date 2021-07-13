import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';

export default class GutenboardingLanguagePickerComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'a[href*="language-modal"]' ) );
	}

	async switchLanguage( languageSlug ) {
		await driverHelper.clickWhenClickable( this.driver, this.expectedElementLocator );
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.language-picker-component__language-button [lang="${ languageSlug }"]` )
		);
	}
}
