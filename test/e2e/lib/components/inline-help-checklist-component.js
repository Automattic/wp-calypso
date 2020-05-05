/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

class InlineHelpChecklistComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.inline-help__onboarding' ) );
	}

	async congratulationsExists() {
		return await this.driver.findElement( By.css( '.checklist-onboarding-welcome' ) );
	}

	async leaveInlineHelpChecklist() {
		if ( this.screenSize === 'MOBILE' ) {
			await this.driver.switchTo().defaultContent();
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.inline-help__popover' )
			);
		}

		return await this.driver.switchTo().defaultContent();
	}
}

export default InlineHelpChecklistComponent;
