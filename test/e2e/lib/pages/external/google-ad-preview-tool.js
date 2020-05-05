/**
 * External dependencies
 */
import { By as by, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverManager from '../../driver-manager';

export default class GoogleAdPreviewTool extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, by.css( '.adt-root' ), url );
	}

	static getURL( screenSize, domain, location, query ) {
		if ( screenSize === 'mobile' ) {
			screenSize = 30001;
		} else if ( screenSize === 'tablet' ) {
			screenSize = 30002;
		} else {
			screenSize = 30000;
		}

		const url =
			'https://adwords.google.com/anon/AdPreview' +
			'?lang=' +
			driverManager.currentLocale() +
			'&loc=' +
			location +
			'&device=' +
			screenSize +
			'&st=' +
			escape( query ) +
			'&domain=' +
			domain;
		return url;
	}

	async getSearchPageUrl() {
		const selector = by.css( 'iframe.iframe-preview' );
		await this.driver.wait(
			until.elementLocated( selector ),
			this.explicitWaitMS,
			'Could not locate the search results'
		);
		const iframe = await this.driver.findElement( selector );
		await this.driver.wait(
			until.elementIsVisible( iframe ),
			this.explicitWaitMS,
			'Could not see search results'
		);

		return await iframe.getAttribute( 'src' );
	}
}
