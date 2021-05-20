/**
 * External dependencies
 */
import { By, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper.js';

export default class GoogleSearchPage extends AsyncBaseContainer {
	constructor( driver ) {
		const frameLocator = By.css( 'iframe.iframe-preview' );
		super( driver, frameLocator );
		this.frameLocator = frameLocator;
	}

	async createAdLink( referenceUrl ) {
		await this.driver.wait(
			until.ableToSwitchToFrame( this.frameLocator ),
			this.explicitWaitMS,
			'Could not switch to iFrame'
		);
		await this.driver.sleep( 2000 ); // https://stackoverflow.com/questions/41429723/unhandled-error-cannot-find-context-with-specified-id-using-robot-framework
		this.adLinklocator = By.xpath(
			'//li[@class="ads-ad"]//a[contains(@href, "' + referenceUrl + '")]'
		);
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, this.adLinkLocator );
	}

	async adExists() {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			this.adLinkLocator
		);
	}

	async getAdUrl() {
		const adLink = await this.driver.findElement( this.adLinkLocator );
		return await adLink.getAttribute( 'href' );
	}

	async getAdHeadline() {
		const adLink = await this.driver.findElement( this.adLinkLocator );
		return await adLink.getText();
	}

	async getAdText() {
		const adLink = await this.driver.findElement( this.adLinkLocator );
		return await adLink.findElement( By.xpath( '../../div[@class="ads-visurl"]/cite' ) ).getText();
	}

	async getAdVisibleUrl() {
		const adLink = await this.driver.findElement( this.adLinkLocator );
		return await adLink
			.findElement( By.xpath( '../../div[contains(@class,"ads-creative")]' ) )
			.getText();
	}
}
