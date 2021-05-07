/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminPluginsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.plugins' ) );
	}

	async activateJetpack() {
		const activateLocator = by.css(
			'tr[data-slug="jetpack"] .activate,tr[data-slug="jetpack"] .activate'
		);
		const located = await driverHelper.isElementLocated( this.driver, activateLocator );
		if ( located === true ) {
			return await driverHelper.clickWhenClickable( this.driver, activateLocator );
		}
	}

	async connectJetpackAfterActivation() {
		const locator = by.css( '.jp-connect-full__card a.is-primary' );
		return await driverHelper.clickWhenClickable( this.driver, locator, 10000 );
	}
}
