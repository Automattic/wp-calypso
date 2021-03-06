import assert from 'assert';
import { By } from 'selenium-webdriver';
import localizationData from '../../localization-data.json';
import AsyncBaseContainer from '../async-base-container';

export default class WPHomePage extends AsyncBaseContainer {
	constructor( driver, url = 'https://wordpress.com/' ) {
		super( driver, By.css( 'body' ), url );
	}

	async setSandboxModeForPayments( sandboxCookieValue ) {
		const setCookieCode = function ( sandboxValue ) {
			window.document.cookie =
				'store_sandbox=' + sandboxValue + ';domain=.wordpress.com;SameSite=None;Secure';
		};
		await this.driver.executeScript( setCookieCode, sandboxCookieValue );
		return true;
	}

	async setCurrencyForPayments( currency ) {
		const setCookieCode = function ( currencyValue ) {
			window.document.cookie =
				'landingpage_currency=' + currencyValue + ';domain=.wordpress.com;SameSite=None;Secure';
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
