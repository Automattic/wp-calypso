/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class ActivityPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.activity-log__wrapper' ) );
	}

	async postTitleDisplayed( postTitle ) {
		const driver = this.driver;
		return await driver.wait( async () => {
			await driver.navigate().refresh();
			// Sometimes activity log take a long time to load it's content. lets wait for it.
			await driverHelper.waitTillPresentAndDisplayed(
				driver,
				By.css( '.activity-log-item:not(.is-loading)' )
			);
			return await driverHelper.isElementPresent(
				driver,
				// data-e2e-activity won't work since activity log has changed.
				// By.css( `.activity-log-item__description-content[data-e2e-activity="${ postTitle }"]` )
				// TODO: Remove xpath
				By.xpath(
					`//div[@class='activity-log-item__description-content']//a[text()='${ postTitle }']`
				)
			);
		}, this.explicitWaitMS * 3 );
	}
}
