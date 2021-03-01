/* eslint-disable jsdoc/check-tag-names */
/** @format */

const { By, until } = require( 'selenium-webdriver' );

const AsyncBaseContainer = require( '../async-base-container' );
const ViewPostPage = require( '../../lib/pages/view-post-page.js' );
const driverHelper = require( '../driver-helper.js' );

class PostPreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		PostPreviewComponent.switchToIFrame( driver );
		super( driver, By.css( '#main' ) );
	}

	async postContent() {
		await PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.postContent();
	}

	async postTitle() {
		await PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.postTitle();
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
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.web-preview__close' )
		);
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

module.exports = PostPreviewComponent;
