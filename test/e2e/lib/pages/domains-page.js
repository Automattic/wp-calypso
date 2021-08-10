import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class DomainsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.domain-management-list__items' ) );
	}

	async clickAddDomain() {
		const hasCustomDomain = await driverHelper.isElementLocated(
			this.driver,
			By.xpath( "//button[text()='Add a domain to this site']" )
		);

		if ( hasCustomDomain ) {
			await driverHelper.clickWhenClickable(
				this.driver,
				By.xpath( "//button[text()='I have a domain']" )
			);
			return await this.clickPopoverItem( 'Search for a domain' );
		}

		const hasDomainCredit = await driverHelper.isElementLocated(
			this.driver,
			By.xpath(
				"//div[@class='empty-domains-list-card__text']/h2[text()='Claim your free domain']"
			)
		);

		const hasPaidPlan = await driverHelper.isElementLocated(
			this.driver,
			By.xpath( "//div[@class='empty-domains-list-card__text']/h2[text()='Add your domain']" )
		);

		if ( hasDomainCredit || hasPaidPlan ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.xpath( "//a[text()='Search for a domain']" )
			);
		}

		return await driverHelper.clickWhenClickable(
			this.driver,
			By.xpath( "//a[text()='Just search for a domain']" )
		);
	}

	async clickPopoverItem( name ) {
		const itemLocator = driverHelper.createTextLocator( By.css( '.popover__menu-item' ), name );
		return await driverHelper.clickWhenClickable( this.driver, itemLocator );
	}
}
