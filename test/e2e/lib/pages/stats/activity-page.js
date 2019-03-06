/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class ActivityPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.activity-log__wrapper' ) );
	}

	async postTitleDisplayed( postTitle ) {
		const driver = this.driver;
		return driver.wait( async () => {
			await driver.navigate().refresh();
			return await driverHelper.isElementPresent(
				driver,
				// data-e2e-activity won't work since activity log has changed.
				// By.css( `.activity-log-item__description-content[data-e2e-activity="${ postTitle }"]` )
				// TODO: Remove xpath
				By.xpath(
					`//div[@class='activity-log-item__description-content']//a[text()='${ postTitle }']`
				)
			);
		}, this.explicitWaitMS * 2 );
	}
}
