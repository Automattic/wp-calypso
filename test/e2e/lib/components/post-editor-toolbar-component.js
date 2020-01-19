/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';

import AsyncBaseContainer from '../async-base-container';
import PostPreviewComponent from './post-preview-component.js';
import EditorConfirmationSidebarComponent from './editor-confirmation-sidebar-component';
import NoticesComponent from './notices-component';

export default class PostEditorToolbarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.editor-ground-control' ) );
		this.publishButtonSelector = By.css( '.editor-publish-button' );
	}

	async ensureSaved( { clickSave = true } = {} ) {
		const onMobile = driverManager.currentScreenSize() === 'mobile';

		const mobileSaveSelector = By.css(
			'div.post-editor__content .editor-ground-control__status button.editor-ground-control__save'
		);
		const desktopSaveSelector = By.css(
			'div.card.editor-ground-control .editor-ground-control__status button.editor-ground-control__save'
		);
		const saveSelector = onMobile ? mobileSaveSelector : desktopSaveSelector;

		const savedSelector = By.css(
			'span.editor-ground-control__save-status[data-e2e-status="Saved"]'
		);

		if ( clickSave === true ) {
			await driverHelper.clickIfPresent( this.driver, saveSelector, 3 );
		}

		return await driverHelper.waitTillPresentAndDisplayed( this.driver, savedSelector );
	}

	async clickPublishPost() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishButtonSelector );
		await this.waitForPublishButtonToBeEnabled();
		return await driverHelper.clickWhenClickable( this.driver, this.publishButtonSelector );
	}

	async submitForReview() {
		return await driverHelper.clickWhenClickable( this.driver, this.publishButtonSelector );
	}

	async launchPreview() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.editor-ground-control__preview-button' ),
			this.explicitWaitMS
		);
	}

	async waitForSuccessViewPostNotice() {
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		return await noticesComponent.isSuccessNoticeDisplayed();
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

	async publishThePost( { useConfirmStep = false } = {} ) {
		await this.clickPublishPost();
		if ( useConfirmStep === true ) {
			const editorConfirmationSidebarComponent = await EditorConfirmationSidebarComponent.Expect(
				this.driver
			);
			return await editorConfirmationSidebarComponent.confirmAndPublish();
		}
		return true;
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

	async waitForIsPendingStatus() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.editor-status-label.is-pending' )
		);
	}

	async statusIsPending() {
		const classNames = await this.driver
			.findElement( By.css( '.editor-status-label' ) )
			.getAttribute( 'class' );
		return classNames.includes( 'is-pending' );
	}

	async waitForIsDraftStatus() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.editor-status-label.is-draft' )
		);
	}

	async statusIsDraft() {
		const classNames = await this.driver
			.findElement( By.css( '.editor-status-label' ) )
			.getAttribute( 'class' );
		return classNames.includes( 'is-draft' );
	}

	async waitForSuccessAndViewPost() {
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		return await noticesComponent.isSuccessNoticeDisplayed( true );
	}

	async closeEditor() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.editor-ground-control__back' )
		);
	}
}
