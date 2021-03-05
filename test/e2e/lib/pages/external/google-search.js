/**
 * External dependencies
 */
import { By as by, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper.js';

export default class GoogleSearchPage extends AsyncBaseContainer {
	constructor( driver ) {
		const frameSelector = by.css( 'iframe.iframe-preview' );
		super( driver, frameSelector );
		this.frameSelector = frameSelector;
	}

	async createAdLink( referenceUrl ) {
		await this.driver.wait(
			until.ableToSwitchToFrame( this.frameSelector ),
			this.explicitWaitMS,
			'Could not switch to iFrame'
		);
		await this.driver.sleep( 2000 ); // https://stackoverflow.com/questions/41429723/unhandled-error-cannot-find-context-with-specified-id-using-robot-framework
		this.adLinkselector = by.xpath(
			'//li[@class="ads-ad"]//a[contains(@href, "' + referenceUrl + '")]'
		);
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.adLinkselector );
	}

	async adExists() {
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.adLinkselector );
	}

	async getAdUrl() {
		const adLink = await this.driver.findElement( this.adLinkselector );
		return await adLink.getAttribute( 'href' );
	}

	async getAdHeadline() {
		const adLink = await this.driver.findElement( this.adLinkselector );
		return await adLink.getText();
	}

	async getAdText() {
		const adLink = await this.driver.findElement( this.adLinkselector );
		return await adLink.findElement( by.xpath( '../../div[@class="ads-visurl"]/cite' ) ).getText();
	}

	async getAdVisibleUrl() {
		const adLink = await this.driver.findElement( this.adLinkselector );
		return await adLink
			.findElement( by.xpath( '../../div[contains(@class,"ads-creative")]' ) )
			.getText();
	}
}
