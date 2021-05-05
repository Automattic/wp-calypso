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

		// Dismiss the domain upsell if present.
		const dismissDomainUpsellLocator = By.css( ' .domain-upsell__continue-link button ' );
		const domainUpsellPresent = await driverHelper.isElementLocated(
			this.driver,
			dismissDomainUpsellLocator
		);
		if ( domainUpsellPresent ) {
			await driverHelper.clickWhenClickable( this.driver, dismissDomainUpsellLocator );
		}

		return await myHomePage.waitForSiteLaunchComplete();
	}
}
