/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import SectionNavComponent from '../components/section-nav-component';
import * as driverHelper from '../driver-helper';
import * as dataHelper from '../data-helper';
import { currentScreenSize } from '../driver-manager';

const by = webdriver.By;
const host = dataHelper.getJetpackHost();

export default class PlansPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.is-section-plans' ) );
	}

	async openPlansTab() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		await sectionNav.ensureMobileMenuOpen();
		const selector = by.css(
			'.current-plan a[href*="plans"]:not([href*="my-plan"]).section-nav-tab__link'
		);
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async openAdvancedPlansSegment() {
		const selector = by.css(
			'.plans-features-main ul.segmented-control.is-primary.plan-features__interval-type.is-customer-type-toggle li:nth-child(2)'
		);
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async waitForComparison() {
		const plansPageMainCssClass =
			host === 'WPCOM' ? '.plans-features-main__group' : '.selector__main';
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			by.css( plansPageMainCssClass )
		);
	}

	async returnFromComparison() {
		return await driverHelper.clickWhenClickable( this.driver, by.css( '.header-cake__back' ) );
	}

	async onePrimaryButtonShown() {
		const selector =
			currentScreenSize() === 'mobile'
				? '.plan-features__mobile .plan-features__actions-button.is-primary'
				: '.plan-features__table-item.is-top-buttons button.plan-features__actions-button.is-primary';
		const count = await driverHelper.getElementCount( this.driver, by.css( selector ) );
		return count === 1;
	}

	async confirmCurrentPlan( planName ) {
		let selector = `.is-${ planName }-plan .plan-pill`;

		if ( this.screenSize === 'mobile' ) {
			selector = '.plan-features__mobile ' + selector;
		} else {
			selector = '.plan-features__table ' + selector;
		}

		if ( host !== 'WPCOM' ) {
			selector = `.is-${ planName }-plan`;
		}

		return driverHelper.isElementEventuallyLocatedAndVisible( this.driver, by.css( selector ) );
	}

	async planTypesShown( planType ) {
		const plansCssHandle =
			planType === 'jetpack' ? '.selector__main' : `[data-e2e-plans="${ planType }"]`;
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			by.css( plansCssHandle )
		);
	}

	async selectPaidPlan() {
		// Wait a little for loading animation
		await this.driver.sleep( 1000 );

		if ( host !== 'WPCOM' ) {
			return await this.selectJetpackSecurity();
		}

		if ( currentScreenSize() === 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.plan-features__mobile button.is-business-plan' )
			);
		}

		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'td.is-top-buttons button.is-business-plan' )
		);
	}

	async selectJetpackSecurity() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '[data-e2e-product-slug="jetpack_security_daily"] .button' )
		);
	}
}
