/**
 * External dependencies
 */
import { By, until } from 'selenium-webdriver';

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
			'.editor-post-publish-panel__header-publish-button button[aria-disabled=false]'
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

	async initEditor( { dismissPageTemplateSelector = false } = {} ) {
		if ( dismissPageTemplateSelector ) {
			this.dismissPageTemplateSelector();
		}
		this.dismissEditorWelcomeModal();
		this.closeSidebar();
	}

	async publish( { visit = false } = {} ) {
		const snackBarNoticeLinkSelector = By.css( '.components-snackbar__content a' );
		await driverHelper.clickWhenClickable( this.driver, this.prePublishButtonSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishHeaderSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishSelector );
		await driverHelper.clickWhenClickable( this.driver, this.publishSelector );
		await driverHelper.waitTillNotPresent( this.driver, this.publishingSpinnerSelector );
		await this.closePublishedPanel();
		await this.waitForSuccessViewPostNotice();
		const url = await this.driver.findElement( snackBarNoticeLinkSelector ).getAttribute( 'href' );

		if ( visit ) {
			await driverHelper.clickWhenClickable( this.driver, snackBarNoticeLinkSelector );
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
		const textSelector = By.css( '.wp-block-paragraph' );
		await driverHelper.clickWhenClickable( this.driver, appenderSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, textSelector );
		return await this.driver.findElement( textSelector ).sendKeys( text );
	}

	async getContent() {
		return await this.driver.findElement( By.css( '.block-editor-block-list__layout' ) ).getText();
	}

	async replaceTextOnLastParagraph( text ) {
		const paragraph = By.css( '.wp-block-paragraph' );
		await driverHelper.clearTextArea( this.driver, paragraph );
		return await this.driver.findElement( paragraph ).sendKeys( text );
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
		let blockClass = name;
		let prefix = '';
		switch ( name ) {
			case 'Instagram':
			case 'Twitter':
			case 'YouTube':
				prefix = 'embed-';
				break;
			case 'Form':
				prefix = 'jetpack-contact-';
				break;
			case 'Simple Payments':
			case 'Markdown':
				prefix = 'jetpack-';
				break;
			case 'Buttons':
			case 'Click to Tweet':
			case 'Hero':
			case 'Logos':
			case 'Pricing Table':
				prefix = 'coblocks-';
				break;
			case 'Dynamic HR':
				prefix = 'coblocks-';
				blockClass = 'dynamic-separator';
				break;
		}

		const inserterBlockItemSelector = By.css(
			`li.block-editor-block-types-list__list-item button.editor-block-list-item-${ prefix }${ blockClass
				.replace( /\s+/g, '-' )
				.toLowerCase() }`
		);
		const insertedBlockSelector = By.css(
			`.block-editor-block-list__block.is-selected[aria-label*='Block: ${ name }']`
		);

		await this.openBlockInserterAndSearch( name );
		// Using a JS click here since the Webdriver click wasn't working
		const button = await this.driver.findElement( inserterBlockItemSelector );
		await this.driver
			.actions( { bridge: true } )
			.move( { origin: button } )
			.perform();
		await this.driver.executeScript( 'arguments[0].click();', button );
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
		const sidebarSelector = '.edit-post-sidebar-header';
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
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( ".edit-post-sidebar-header__small button[aria-label='Close settings']" )
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
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-publish-panel__header button[aria-label="Close panel"]' )
		);
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

	async launchPreview() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-preview' ),
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
		const viewPostSelector = By.css( '.components-snackbar__content a' );
		await driverHelper.clickWhenClickable( this.driver, viewPostSelector );
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
		await driverHelper.clickWhenClickable( this.driver, By.css( '.dashicons-no-alt' ) );
	}

	async submitForReview() {
		await driverHelper.clickWhenClickable( this.driver, this.prePublishButtonSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishHeaderSelector );
		return await driverHelper.clickWhenClickable( this.driver, this.publishSelector );
	}

	async closeEditor() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-post-fullscreen-mode-close__toolbar, .edit-post-header-toolbar__back' )
		);
	}

	async dismissPageTemplateSelector() {
		if ( await driverHelper.isElementPresent( this.driver, By.css( '.page-template-modal' ) ) ) {
			if ( driverManager.currentScreenSize() === 'mobile' ) {
				await driverHelper.selectElementByText(
					this.driver,
					By.css( '.template-selector-item__template-title' ),
					'Blank'
				);
			} else {
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.page-template-modal__buttons .components-button.is-primary' )
				);
			}
		}
	}

	async dismissEditorWelcomeModal() {
		if (
			await driverHelper.isElementPresent( this.driver, By.css( '.edit-post-welcome-guide' ) )
		) {
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.edit-post-welcome-guide .components-modal__header .components-button' )
			);
		}
	}
}
