import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class EditorConfirmationSidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.editor-confirmation-sidebar.is-active' ) );
	}

	async confirmAndPublish() {
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.editor-confirmation-sidebar__action button.button' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-confirmation-sidebar__action button.button' )
		);
	}

	async publishDateShown() {
		const dateLocator = By.css(
			'.editor-confirmation-sidebar .editor-publish-date__header-chrono'
		);
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, dateLocator );
		return await this.driver.findElement( dateLocator ).getText();
	}
}
