/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';
import assert from 'assert';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

export default class LandingPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, by.css( 'header.masterbar' ), url );
	}

	checkURL() {
		this.driver.getCurrentUrl().then( ( currentUrl ) => {
			assert.strictEqual(
				true,
				currentUrl.includes( 'wordpress.com' ),
				`The current url: '${ currentUrl }' does not include 'wordpress.com'`
			);
		} );
	}

	checkLocalizedString( targetString ) {
		this.waitForPage();
		return assert(
			this.driver.findElement( by.linkText( targetString ) ),
			'The landing page does not have the expected localized string "' + targetString + '"'
		);
	}
}
