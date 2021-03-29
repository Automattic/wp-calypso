/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class SectionNavComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.section-nav' ) );
	}

	async ensureMobileMenuOpen() {
		if ( process.env.BROWSERSIZE !== 'mobile' ) {
			return null;
		}

		const mobileHeaderLocator = By.css( '.section-nav__mobile-header' );
		const openMenuLocator = By.css( '.section-nav.is-open' );
		const menuElement = await this.driver.findElement( this.expectedElementSelector );
		const isMenuOpen = await menuElement
			.getAttribute( 'class' )
			.then( ( classNames ) => classNames.includes( 'is-open' ) );

		if ( ! isMenuOpen ) {
			await driverHelper.clickWhenClickable( this.driver, mobileHeaderLocator );
			await driverHelper.waitTillPresentAndDisplayed( this.driver, openMenuLocator );
		}
	}
}
