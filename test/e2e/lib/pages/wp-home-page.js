/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';
import assert from 'assert';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import localizationData from '../../localization-data.json';

const by = webdriver.By;

export default class WPHomePage extends AsyncBaseContainer {
	constructor( driver, url = 'https://wordpress.com/' ) {
		super( driver, by.css( 'body' ), url );
	}

	async setSandboxModeForPayments( sandboxCookieValue ) {
		const setCookieCode = function ( sandboxValue ) {
			window.document.cookie = 'store_sandbox=' + sandboxValue + ';domain=.wordpress.com';
		};
		await this.driver.executeScript( setCookieCode, sandboxCookieValue );
		return true;
	}

	async setCurrencyForPayments( currency ) {
		const setCookieCode = function ( currencyValue ) {
			window.document.cookie = 'landingpage_currency=' + currencyValue + ';domain=.wordpress.com';
		};
		return await this.driver.executeScript( setCookieCode, currency );
	}

	async checkURL( culture ) {
		const target = culture ? localizationData[ culture ].wpcom_base_url : 'wordpress.com';
		const currentUrl = await this.driver.getCurrentUrl();
		return assert.strictEqual(
			true,
			currentUrl.includes( target ),
			`The current url: '${ currentUrl }' does not include ${ target }`
		);
	}
}
