/* eslint-disable jsdoc/check-tag-names */
/** @format */

const { By } = require( 'selenium-webdriver' );
const driverHelper = require( '../driver-helper.js' );

const AsyncBaseContainer = require( '../async-base-container' );
const PostPreviewComponent = require( './post-preview-component.js' );
const EditorConfirmationSidebarComponent = require( './editor-confirmation-sidebar-component' );

class PostEditorToolbarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.editor-ground-control' ) );
		this.publishButtonSelector = By.css( '.editor-publish-button' );
	}

	async ensureSaved() {
		const savedSelector = By.css(
			'span.editor-ground-control__save-status[data-e2e-status="Saved"]'
		);

		return await driverHelper.waitTillPresentAndDisplayed( this.driver, savedSelector );
	}

	async clickPublishPost() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishButtonSelector );
		await this.waitForPublishButtonToBeEnabled();
		return await driverHelper.clickWhenClickable( this.driver, this.publishButtonSelector );
	}

	async publishAndViewContent( { reloadPageTwice = false, useConfirmStep = false } = {} ) {
		await this.clickPublishPost();
		if ( useConfirmStep === true ) {
			const editorConfirmationSidebarComponent = await EditorConfirmationSidebarComponent.Expect(
				this.driver
			);
			await editorConfirmationSidebarComponent.confirmAndPublish();
		}

		const previewComponent = await PostPreviewComponent.Expect( this.driver );
		await previewComponent.edit();

		return await this.viewPublishedPostOrPage( { reloadPageTwice: reloadPageTwice } );
	}

	async viewPublishedPostOrPage( { reloadPageTwice = false } = {} ) {
		const viewPostSelector = By.css( '.editor-action-bar__cell.is-right a' );
		const driver = this.driver;

		await driverHelper.waitTillPresentAndDisplayed( this.driver, viewPostSelector );

		const url = await driver.findElement( viewPostSelector ).getAttribute( 'href' );
		if ( reloadPageTwice === true ) {
			await driver.get( url );
		}
		return await driver.get( url );
	}

	async waitForPublishButtonToBeEnabled() {
		const self = this;

		const d = await self.driver
			.findElement( self.publishButtonSelector )
			.getAttribute( 'disabled' );
		return d !== 'true';
	}
}

module.exports = PostEditorToolbarComponent;
