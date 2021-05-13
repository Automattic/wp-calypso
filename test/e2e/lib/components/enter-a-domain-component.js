/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

export default class EnterADomainComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.map-domain-step__add-domain' ) );
	}

	async enterADomain( blogName ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.map-domain-step__external-domain' ),
			blogName
		);
	}

	async clickonAddButtonToAddDomainToTheCart() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.map-domain-step__go.button.is-primary' )
		);
	}
}
