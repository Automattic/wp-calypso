/**
 * External dependencies
 */
import { By, Key, until } from 'selenium-webdriver';
import { kebabCase } from 'lodash';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager.js';
import AsyncBaseContainer from '../async-base-container';
import { ContactFormBlockComponent } from './blocks/contact-form-block-component';
import { ShortcodeBlockComponent } from './blocks/shortcode-block-component';
import { ImageBlockComponent } from './blocks/image-block-component';

export default class GutenbergEditorComponent extends AsyncBaseContainer {
	constructor( driver, url, editorType = 'iframe' ) {
		super( driver, By.css( '.edit-post-header' ), url );
		this.editorType = editorType;

		this.publishSelector = By.css(
			'.editor-post-publish-panel__header-publish-button button.editor-post-publish-button'
		);
		this.publishingSpinnerSelector = By.css(
			'.editor-post-publish-panel__content .components-spinner'
		);
		this.prePublishButtonSelector = By.css( '.editor-post-publish-panel__toggle' );
		this.publishHeaderSelector = By.css( '.editor-post-publish-panel__header' );
		this.editoriFrameSelector = By.css( '.calypsoify.is-iframe iframe' );
	}

	static async Expect( driver, editorType ) {
		const page = new this( driver, null, editorType );
		await page._expectInit();
		return page;
	}

	async _preInit() {
		if ( this.editorType !== 'iframe' ) {
			return;
		}
		await this.driver.switchTo().defaultContent();
		await this.driver.wait(
			until.ableToSwitchToFrame( this.editoriFrameSelector ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await this.driver.sleep( 2000 );
	}

	async _postInit() {
		await this.driver.sleep( 2000 );
	}

	async initEditor( { dismissPageTemplateSelector = false } = {} ) {
		if ( dismissPageTemplateSelector ) {
			await this.dismissPageTemplateSelector();
		}
		await this.dismissEditorWelcomeModal();
		return await this.closeSidebar();
	}

	async publish( { visit = false } = {} ) {
		const snackBarNoticeLinkSelector = By.css( '.components-snackbar__content a' );
		await driverHelper.clickWhenClickable( this.driver, this.prePublishButtonSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishHeaderSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishSelector );
		await this.driver.sleep( 1000 );
		const button = await this.driver.findElement( this.publishSelector );
		await this.driver.executeScript( 'arguments[0].click();', button );
		await driverHelper.waitTillNotPresent( this.driver, this.publishingSpinnerSelector );
		await this.closePublishedPanel();
		await this.waitForSuccessViewPostNotice();
		const url = await this.driver.findElement( snackBarNoticeLinkSelector ).getAttribute( 'href' );

		if ( visit ) {
			const snackbar = await this.driver.findElement( snackBarNoticeLinkSelector );
			await this.driver.executeScript( 'arguments[0].click();', snackbar );
		}

		await driverHelper.acceptAlertIfPresent( this.driver );
		return url;
	}

	async update( { visit = false } = {} ) {
		await this.driver.sleep( 3000 );
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.editor-post-publish-button' )
		);

		if ( visit ) {
			await this.waitForSuccessViewPostNotice();
			await this.driver.sleep( 1000 );
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.components-snackbar__content a' )
			);
		}
	}

	async enterTitle( title ) {
		const titleFieldSelector = By.css( '.editor-post-title__input' );
		await driverHelper.clearTextArea( this.driver, titleFieldSelector );
		return await this.driver.findElement( titleFieldSelector ).sendKeys( title );
	}

	async getTitle() {
		return await this.driver
			.findElement( By.css( '.editor-post-title__input' ) )
			.getAttribute( 'value' );
	}

	async enterText( text ) {
		const appenderSelector = By.css( '.block-editor-default-block-appender' );
		const paragraphSelector = By.css( 'p.block-editor-rich-text__editable:first-of-type' );
		await driverHelper.clickWhenClickable( this.driver, appenderSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, paragraphSelector );
		return await this.driver.findElement( paragraphSelector ).sendKeys( text );
	}

	async getContent() {
		return await this.driver.findElement( By.css( '.block-editor-block-list__layout' ) ).getText();
	}

	async replaceTextOnLastParagraph( text ) {
		const paragraphSelector = By.css( 'p.block-editor-rich-text__editable:first-of-type' );
		await driverHelper.clearTextArea( this.driver, paragraphSelector );
		return await this.driver.findElement( paragraphSelector ).sendKeys( text );
	}

	async insertShortcode( shortcode ) {
		const blockID = await this.addBlock( 'Shortcode' );

		const shortcodeBlock = await ShortcodeBlockComponent.Expect( this.driver, blockID );
		return await shortcodeBlock.enterShortcode( shortcode );
	}

	async insertContactForm( email, subject ) {
		const blockID = await this.addBlock( 'Form' );

		const contactFormBlock = await ContactFormBlockComponent.Expect( this.driver, blockID );
		await contactFormBlock.insertEmail( email );
		await contactFormBlock.insertSubject( subject );
		return await contactFormBlock.submitForm();
	}

	async contactFormDisplayedInEditor() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '[data-type="jetpack/contact-form"]' )
		);
	}

	async errorDisplayed() {
		await this.driver.sleep( 1000 );
		return await driverHelper.isElementPresent( this.driver, By.css( '.editor-error-boundary' ) );
	}

	async hasInvalidBlocks() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.block-editor-warning' ) );
	}

	async openBlockInserterAndSearch( searchTerm ) {
		await driverHelper.scrollIntoView(
			this.driver,
			By.css( '.block-editor-writing-flow' ),
			'start'
		);
		const inserterToggleSelector = By.css( '.edit-post-header .block-editor-inserter__toggle' );
		const inserterMenuSelector = By.css( '.block-editor-inserter__menu' );
		const inserterSearchInputSelector = By.css( 'input.block-editor-inserter__search' );
		if ( await driverHelper.elementIsNotPresent( this.driver, inserterMenuSelector ) ) {
			await driverHelper.waitTillPresentAndDisplayed( this.driver, inserterToggleSelector );
			await driverHelper.clickWhenClickable( this.driver, inserterToggleSelector );
			await driverHelper.waitTillPresentAndDisplayed( this.driver, inserterMenuSelector );
		}
		await driverHelper.setWhenSettable( this.driver, inserterSearchInputSelector, searchTerm );
	}

	async isBlockCategoryPresent( name ) {
		const categorySelector = '.block-editor-inserter__results .components-panel__body-title';
		const categoryName = await this.driver.findElement( By.css( categorySelector ) ).getText();
		return categoryName === name;
	}

	async closeBlockInserter() {
		const inserterCloseSelector = By.css(
			driverManager.currentScreenSize() === 'mobile'
				? '.block-editor-inserter__popover .components-popover__close'
				: '.edit-post-header .block-editor-inserter__toggle'
		);
		const inserterMenuSelector = By.css( '.block-editor-inserter__menu' );
		await driverHelper.clickWhenClickable( this.driver, inserterCloseSelector );
		await driverHelper.waitTillNotPresent( this.driver, inserterMenuSelector );
	}

	// return blockID - top level block id which is looks like `block-b91ce479-fb2d-45b7-ad92-22ae7a58cf04`. Should be used for further interaction with added block.
	async addBlock( name ) {
		name = name.charAt( 0 ).toUpperCase() + name.slice( 1 ); // Capitalize block name
		let blockClass = kebabCase( name.toLowerCase() );
		let hasChildBlocks = false;
		let prefix = '';
		switch ( name ) {
			case 'Instagram':
			case 'Twitter':
			case 'YouTube':
				prefix = 'embed-';
				break;
			case 'Form':
				prefix = 'jetpack-';
				blockClass = 'contact-form';
				break;
			case 'Simple Payments':
				prefix = 'jetpack-';
				blockClass = 'simple-payments';
				break;
			case 'Markdown':
				prefix = 'jetpack-';
				break;
			case 'Buttons':
			case 'Click to Tweet':
			case 'Hero':
				prefix = 'coblocks-';
				break;
			case 'Pricing Table':
				prefix = 'coblocks-';
				hasChildBlocks = true;
				break;
			case 'Logos & Badges':
				prefix = 'coblocks-';
				blockClass = 'logos';
				break;
			case 'Dynamic HR':
				prefix = 'coblocks-';
				blockClass = 'dynamic-separator';
				break;
		}

		const inserterBlockItemSelector = By.css(
			`li.block-editor-block-types-list__list-item button.editor-block-list-item-${ prefix }${ blockClass }`
		);
		const insertedBlockSelector = By.css(
			`.block-editor-block-list__block.${
				hasChildBlocks ? 'has-child-selected' : 'is-selected'
			}[aria-label*='Block: ${ name }']`
		);

		await this.openBlockInserterAndSearch( name );

		if ( await driverHelper.elementIsNotPresent( this.driver, inserterBlockItemSelector ) ) {
			await driverHelper.waitTillPresentAndDisplayed( this.driver, inserterBlockItemSelector );
		}

		// The normal click is needed to avoid hovering the element, which seems
		// to cause the element to become stale.
		await driverHelper.clickWhenClickable( this.driver, inserterBlockItemSelector );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, insertedBlockSelector );
		return await this.driver.findElement( insertedBlockSelector ).getAttribute( 'id' );
	}

	async titleShown() {
		const titleSelector = By.css( '.editor-post-title__input' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, titleSelector );
		const element = await this.driver.findElement( titleSelector );
		return await element.getAttribute( 'value' );
	}

	async addImage( fileDetails ) {
		const blockID = await this.addBlock( 'Image' );

		const imageBlock = await ImageBlockComponent.Expect( this.driver, blockID );
		return await imageBlock.uploadImage( fileDetails );
	}

	async addImageFromMediaModal( fileDetails ) {
		const blockId = await this.addBlock( 'Image' );

		const imageBlock = await ImageBlockComponent.Expect( this.driver, blockId );
		return await imageBlock.insertImageFromMediaModal( fileDetails );
	}

	async toggleSidebar( open = true ) {
		// @TODO: Remove .edit-post-* selector in favor of .interface-* selector when Gutenberg 7.9 is deployed.
		const sidebarSelector = '.edit-post-sidebar-header, .interface-complementary-area-header';
		const sidebarOpen = await driverHelper.isElementPresent(
			this.driver,
			By.css( sidebarSelector )
		);
		if ( open && ! sidebarOpen ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( "button[aria-label='Settings']" )
			);
		}

		if ( ! open && sidebarOpen ) {
			if ( driverManager.currentScreenSize() === 'desktop' ) {
				return await driverHelper.clickWhenClickable(
					this.driver,
					By.css( ".edit-post-sidebar__panel-tabs button[aria-label='Close settings']" )
				);
			}
			// @TODO: Remove .edit-post-* selector in favor of .interface-* selector when Gutenberg 7.9 is deployed.
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css(
					".interface-complementary-area-header__small button[aria-label='Close settings'], .edit-post-sidebar-header__small button[aria-label='Close settings']"
				)
			);
		}
	}

	async openSidebar() {
		return await this.toggleSidebar( true );
	}

	async closeSidebar() {
		return await this.toggleSidebar( false );
	}

	async closePublishedPanel() {
		const closeButton = await this.driver.findElement(
			By.css( '.editor-post-publish-panel__header button[aria-label="Close panel"]' )
		);
		return await this.driver.executeScript( 'arguments[0].click();', closeButton );
	}

	async ensureSaved() {
		await driverHelper.clickWhenClickable( this.driver, By.css( '.editor-post-save-draft' ) );
		const savedSelector = By.css( 'span.is-saved' );

		return await driverHelper.waitTillPresentAndDisplayed( this.driver, savedSelector );
	}

	async waitForSuccessViewPostNotice() {
		const noticeSelector = By.css( '.components-snackbar' );
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, noticeSelector );
	}

	async dismissSuccessNotice() {
		await this.waitForSuccessViewPostNotice();
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.components-snackbar' ) );
	}

	// @TODO: Update to new `.editor-post-preview__dropdown` format once we support it again
	// https://github.com/Automattic/wp-calypso/issues/40401
	async launchPreview() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.components-button.editor-post-preview' ),
			this.explicitWaitMS
		);
	}

	async revertToDraft() {
		const revertDraftSelector = By.css( 'button.editor-post-switch-to-draft' );
		await driverHelper.clickWhenClickable( this.driver, revertDraftSelector );
		const revertAlert = await this.driver.switchTo().alert();
		await revertAlert.accept();
		await this.waitForSuccessViewPostNotice();
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( 'button.editor-post-publish-panel__toggle' )
		);
		return await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( 'button.editor-post-switch-to-draft' )
		);
	}

	async isDraft() {
		const hasPublishButton = await driverHelper.isElementPresent(
			this.driver,
			By.css( 'button.editor-post-publish-panel__toggle' )
		);
		const hasRevertButton = await driverHelper.isElementPresent(
			this.driver,
			By.css( 'button.editor-post-switch-to-draft' )
		);
		return hasPublishButton && ! hasRevertButton;
	}

	async viewPublishedPostOrPage() {
		const viewPostLink = await this.driver.findElement(
			By.css( '.components-snackbar__content a' )
		);
		await this.driver.executeScript( 'arguments[0].click()', viewPostLink );
	}

	async schedulePost( publishDate ) {
		await driverHelper.clickWhenClickable( this.driver, this.prePublishButtonSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishHeaderSelector );
		await driverHelper.verifyTextPresent(
			this.driver,
			By.css( '.editor-post-publish-panel__link' ),
			publishDate
		);
		await driverHelper.clickWhenClickable( this.driver, this.publishSelector );
		await driverHelper.waitTillNotPresent( this.driver, this.publishingSpinnerSelector );
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.editor-post-publish-panel__header-published' )
		);
		return await driverHelper.verifyTextPresent(
			this.driver,
			By.css( '.editor-post-publish-panel__header-published' ),
			'Scheduled'
		);
	}

	async closeScheduledPanel() {
		const publishCloseButtonSelector = By.css(
			'.editor-post-publish-panel__header > .components-button'
		);
		return await driverHelper.clickWhenClickable( this.driver, publishCloseButtonSelector );
	}

	async submitForReview() {
		await driverHelper.clickWhenClickable( this.driver, this.prePublishButtonSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishHeaderSelector );
		return await driverHelper.clickWhenClickable( this.driver, this.publishSelector );
	}

	async closeEditor() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			return await this.driver.navigate().back();
		}
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				'.edit-post-header .edit-post-fullscreen-mode-close, .edit-post-header-toolbar__back'
			)
		);
	}

	async dismissPageTemplateSelector() {
		if ( await driverHelper.isElementPresent( this.driver, By.css( '.page-template-modal' ) ) ) {
			if ( driverManager.currentScreenSize() === 'mobile' ) {
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( 'button.template-selector-item__label[value="blank"]' )
				);
			} else {
				const useBlankButton = await this.driver.findElement(
					By.css( '.page-template-modal__buttons .components-button.is-primary' )
				);
				await this.driver.executeScript( 'arguments[0].click()', useBlankButton );
			}
		}
	}

	async dismissEditorWelcomeModal() {
		const welcomeModal = By.css( '.components-guide__container' );
		if ( await driverHelper.isEventuallyPresentAndDisplayed( this.driver, welcomeModal ) ) {
			try {
				// Easiest way to dismiss it, but it might not work in IE.
				await this.driver.findElement( By.css( '.components-guide' ) ).sendKeys( Key.ESCAPE );
			} catch {
				// Click to the last page of the welcome guide.
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( 'ul.components-guide__page-control li:last-child button' )
				);
				// Click the finish button.
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.components-guide__finish-button' )
				);
			}
		}
	}
}
