/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import ViewPostPage from '../../lib/pages/view-post-page.js';
import * as driverHelper from '../driver-helper.js';

const explicitWaitMS = config.get( 'explicitWaitMS' );
const previewWindowMainLocator = By.css( '#main' );

export default class PostPreviewExternalComponent extends AsyncBaseContainer {
	constructor( driver ) {
		PostPreviewExternalComponent.switchToWindow( driver );
		super( driver, previewWindowMainLocator );
	}

	async postTitle() {
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.postTitle();
	}

	async postContent() {
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.postContent();
	}

	async categoryDisplayed() {
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.categoryDisplayed();
	}

	async tagDisplayed() {
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.tagDisplayed();
	}

	async imageDisplayed( fileDetails ) {
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.imageDisplayed( fileDetails );
	}

	async close() {
		this.driver.close();
		const handles = await this.driver.getAllWindowHandles();
		this.driver.switchTo().window( handles[ 0 ] );
	}

	async isDisplayed() {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			previewWindowMainLocator,
			explicitWaitMS
		);
	}

	static async switchToWindow( driver ) {
		const handles = await driver.getAllWindowHandles();
		await driver.switchTo().window( handles[ 1 ] );
	}
}
