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
		const activateSelector = by.css(
			'tr[data-slug="jetpack"] .activate,tr[data-slug="jetpack"] .activate'
		);
		const located = await driverHelper.isElementPresent( this.driver, activateSelector );
		if ( located === true ) {
			return await driverHelper.clickWhenClickable( self.driver, activateSelector );
		}
	}

	async connectJetpackAfterActivation() {
		const selector = by.css( '.jp-connect-full__card a.is-primary' );
		return await driverHelper.clickWhenClickable( this.driver, selector, 10000 );
	}
}
