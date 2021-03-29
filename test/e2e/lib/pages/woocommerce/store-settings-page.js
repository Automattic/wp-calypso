/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';
import SectionNavComponent from '../components/section-nav-component';

const by = webdriver.By;

export default class StoreSettingsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.woocommerce .settingsPayments' ) );
	}

	async selectPaymentsTab() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		sectionNav.ensureMobileMenuOpen();
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.woocommerce .section-nav__panel a[href*=payments]' )
		);
	}

	async paymentsSettingsDisplayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.woocommerce .settingsPayments' )
		);
	}

	async selectShippingTab() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		sectionNav.ensureMobileMenuOpen();
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.woocommerce .section-nav__panel a[href*=shipping]' )
		);
	}

	async shippingSettingsDisplayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.woocommerce .shipping' )
		);
	}

	async selectTaxesTab() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		sectionNav.ensureMobileMenuOpen();
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.woocommerce .section-nav__panel a[href*=taxes]' )
		);
	}

	async taxesSettingsDisplayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.woocommerce .settings-taxes' )
		);
	}
}
