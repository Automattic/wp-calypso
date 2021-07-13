import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class DomainOnlySettingsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.domain-only-site__settings-notice' ) );
	}

	async manageDomain() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'main .button[href^="/domains/manage/"]' )
		);
	}
}
