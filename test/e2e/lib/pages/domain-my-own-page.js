import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';

export default class MyOwnDomainPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.use-my-domain' ) );
	}

	async selectAddDomainMapping( domainToMap ) {
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.use-my-domain__domain-input-fieldset .form-text-input' ),
			domainToMap
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.use-my-domain__domain-input-button' )
		);
		// We just need to check if the button is clickable.
		// If it's clicked, a domain mapping will be created for the site.
		return await driverHelper.waitUntilElementClickable(
			this.driver,
			By.css( '.option-content__action button:not(.is-primary)' )
		);
	}
}
