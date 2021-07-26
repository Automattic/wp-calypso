import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import NoticesComponent from '../components/notices-component';
import * as driverHelper from '../driver-helper.js';

export default class DisconnectSurveyPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.disconnect-site__survey' ) );
	}

	async skipSurvey() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.disconnect-site__navigation-links a[href*=confirm]' )
		);
		return await driverHelper.isElementLocated( this.driver, By.css( '.is-primary.is-scary' ) );
	}

	async skipSurveyAndDisconnectSite() {
		await this.skipSurvey();
		await driverHelper.clickWhenClickable( this.driver, By.css( '.is-primary.is-scary' ) );
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		return await noticesComponent.isSuccessNoticeDisplayed();
	}
}
