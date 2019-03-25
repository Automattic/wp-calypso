/** @format */

import { By, until } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';
import ViewPostPage from '../../lib/pages/view-post-page.js';
import * as driverHelper from '../driver-helper.js';

export default class PostPreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		PostPreviewComponent.switchToIFrame( driver );
		super( driver, By.css( '#main' ) );
	}

	async _postInit() {
		return await this.driver.switchTo().defaultContent();
	}

	async postTitle() {
		await PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.postTitle();
	}

	async postContent() {
		await PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.postContent();
	}

	async categoryDisplayed() {
		await PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.categoryDisplayed();
	}

	async tagDisplayed() {
		await PostPreviewComponent.switchToIFrame( this.driver );
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.tagDisplayed();
	}

	async imageDisplayed( fileDetails ) {
		await PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.imageDisplayed( fileDetails );
	}

	async edit() {
		await this.driver.switchTo().defaultContent();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.button.web-preview__edit' )
		);
	}

	async close() {
		await this.driver.switchTo().defaultContent();
		let closeButton = await this.driver.findElement( By.css( 'button.web-preview__close' ) );
		return await this.driver.executeScript( 'arguments[0].click()', closeButton );
	}

	static async switchToIFrame( driver ) {
		const iFrameSelector = By.css( '.web-preview__frame' );
		const webPreview = By.css( '.web-preview__inner.is-visible.is-loaded' );

		await driver.switchTo().defaultContent();
		await driverHelper.waitTillPresentAndDisplayed( driver, webPreview );
		return await driver.wait(
			until.ableToSwitchToFrame( iFrameSelector ),
			this.explicitWaitMS,
			'Could not switch to web preview iFrame'
		);
	}
}
