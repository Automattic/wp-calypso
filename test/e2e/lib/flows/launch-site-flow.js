/**
 * External dependencies
 */

import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import FindADomainComponent from '../components/find-a-domain-component';
import PickAPlanPage from '../pages/signup/pick-a-plan-page';
import MyHomePage from '../pages/my-home-page';

import * as driverHelper from '../driver-helper.js';

export default class LaunchSiteFlow {
	constructor( driver ) {
		this.driver = driver;
	}
	async launchFreeSite() {
		const myHomePage = await MyHomePage.Expect( this.driver );
		await myHomePage.launchSiteFromSiteSetup();

		const findADomainComponent = await FindADomainComponent.Expect( this.driver );
		await findADomainComponent.skipSuggestion();

		const pickAPlanPage = await PickAPlanPage.Expect( this.driver );
		await pickAPlanPage.selectFreePlan();

		// Wait for navigation to take place from Plan Selection to domain upsell.
		await this.driver.sleep( 1000 );

		// Dismiss the domain upsell if present.
		const dismissDomainUpsellSelector = By.css( ' .domain-upsell__continue-link button ' );
		if ( driverHelper.isElementPresent( dismissDomainUpsellSelector ) ) {
			return await driverHelper.clickWhenClickable( this.driver, dismissDomainUpsellSelector );
		}

		return await myHomePage.isSiteLaunched();
	}
}
