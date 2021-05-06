/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

/**
 * A component used to display a particular section's navigation bar. Or more
 * traditionally, the sub navigation most commonly seen near the top of a page.
 *
 *  @see {@link /client/components/section-nav/README.md}
 */
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
		const menuElement = await this.driver.findElement( this.expectedElementLocator );
		const isMenuOpen = await menuElement
			.getAttribute( 'class' )
			.then( ( classNames ) => classNames.includes( 'is-open' ) );

		if ( ! isMenuOpen ) {
			await driverHelper.clickWhenClickable( this.driver, mobileHeaderLocator );
			await driverHelper.waitUntilElementLocatedAndVisible( this.driver, openMenuLocator );
		}
	}
}
