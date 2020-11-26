/**
 * External dependencies
 */
import { By, Key, until, webdriver } from 'selenium-webdriver';
import { kebabCase } from 'lodash';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager.js';
import AsyncBaseContainer from '../async-base-container';
import { ContactFormBlockComponent } from './blocks';
import { ShortcodeBlockComponent } from './blocks/shortcode-block-component';
import { ImageBlockComponent } from './blocks/image-block-component';
import { FileBlockComponent } from './blocks/file-block-component';

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

	async publish( { visit = false, closePanel = true } = {} ) {
		const snackBarNoticeLinkSelector = By.css( '.components-snackbar__content a' );
		await driverHelper.clickWhenClickable( this.driver, this.prePublishButtonSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishHeaderSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.publishSelector );
		await this.driver.sleep( 1000 );
		const button = await this.driver.findElement( this.publishSelector );
		await this.driver.executeScript( 'arguments[0].click();', button );
		await driverHelper.waitTillNotPresent( this.driver, this.publishingSpinnerSelector );
		if ( closePanel ) {
			try {
				await this.closePublishedPanel();
			} catch ( e ) {
				console.log( 'Publish panel already closed' );
			}
		}
		await this.waitForSuccessViewPostNotice();
		const url = await this.driver.findElement( snackBarNoticeLinkSelector ).getAttribute( 'href' );

		if ( visit ) {
			const snackbar = await this.driver.findElement( snackBarNoticeLinkSelector );
			await this.driver.executeScript( 'arguments[0].click();', snackbar );
		}
		await this.driver.sleep( 1000 );
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
		await contactFormBlock.openEditSettings();
		await contactFormBlock.insertEmail( email );
		return contactFormBlock.insertSubject( subject );
	}

	async toggleOptionsMenu() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.xpath( "//button[@aria-label='Options']" )
		);

		// This sleep is needed for the Options menu to be accessible. I've tried `waitTillPresentAndDisplayed`
		// but it doesn't seem to work consistently, but this is pending improvement as this adds up on total time.
		await this.driver.sleep( 2000 );
	}

	async switchToCodeEditor() {
		await this.toggleOptionsMenu();

		await driverHelper.clickWhenClickable(
			this.driver,
			By.xpath( "//div[@aria-label='Options']//button[. = 'Code editor']" )
		);

		// Wait for the code editor element.
		const textAreaSelector = By.css( 'textarea.editor-post-text-editor' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, textAreaSelector );

		// Close the menu.
		await this.toggleOptionsMenu();

		return textAreaSelector;
	}

	async exitCodeEditor() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.xpath( "//button[text()='Exit code editor']" )
		);
	}

	async getBlocksCode() {
		const textAreaSelector = await this.switchToCodeEditor();
		const blocksCode = this.driver.findElement( textAreaSelector ).getAttribute( 'value' );
		await this.exitCodeEditor();

		return blocksCode;
	}

	async setBlocksCode( blocksCode ) {
		const textAreaSelector = await this.switchToCodeEditor();
		await driverHelper.setWhenSettable( this.driver, textAreaSelector, blocksCode );
		await this.exitCodeEditor();
	}

	blockDisplayedInEditor( dataTypeSelectorVal ) {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( `[data-type="${ dataTypeSelectorVal }"]` )
		);
	}

	contactFormDisplayedInEditor() {
		return this.blockDisplayedInEditor( 'jetpack/contact-form' );
	}

	async errorDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '.editor-error-boundary' )
		);
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
		const inserterToggleSelector = By.css(
			'.edit-post-header .edit-post-header-toolbar__inserter-toggle'
		);
		const inserterMenuSelector = By.css( '.block-editor-inserter__menu' );
		const inserterSearchInputSelector = By.css( 'input.block-editor-inserter__search-input' );

		if ( await driverHelper.elementIsNotPresent( this.driver, inserterMenuSelector ) ) {
			await driverHelper.waitTillPresentAndDisplayed( this.driver, inserterToggleSelector );

			await driverHelper.clickWhenClickable( this.driver, inserterToggleSelector );
			// "Click" twice - the first click seems to trigger a tooltip, the second opens the menu
			// See https://github.com/Automattic/wp-calypso/issues/43179
			if ( await driverHelper.elementIsNotPresent( this.driver, inserterMenuSelector ) ) {
				await driverHelper.clickWhenClickable( this.driver, inserterToggleSelector );
			}

			await driverHelper.waitTillPresentAndDisplayed( this.driver, inserterMenuSelector );
		}
		await driverHelper.setWhenSettable( this.driver, inserterSearchInputSelector, searchTerm );
	}

	// @TODO: Remove `.block-editor-inserter__results .components-panel__body-title` selector in favor of the `.block-editor-inserter__block-list .block-editor-inserter__panel-title` selector when Gutenberg 8.0.0 is deployed.
	async isBlockCategoryPresent( name ) {
		const categorySelector =
			'.block-editor-inserter__results .components-panel__body-title, .block-editor-inserter__block-list .block-editor-inserter__panel-title';
		const categoryName = await this.driver.findElement( By.css( categorySelector ) ).getText();
		return categoryName.toLowerCase() === name.toLowerCase();
	}

	async closeBlockInserter() {
		// @TODO: Remove `.edit-post-header .block-editor-inserter__toggle` selector in favor of the `.edit-post-header-toolbar__inserter-toggle` selector when Gutenberg 8.0.0 is deployed.
		// @TODO: Remove `.block-editor-inserter__popover .components-popover__close` selector in favor of the `.edit-post-layout__inserter-panel-header .components-button` selector when Gutenberg 8.0.0 is deployed.
		const inserterCloseSelector = By.css(
			driverManager.currentScreenSize() === 'mobile'
				? '.block-editor-inserter__popover .components-popover__close, .edit-post-layout__inserter-panel-header .components-button'
				: '.edit-post-header .block-editor-inserter__toggle, .edit-post-header .edit-post-header-toolbar__inserter-toggle'
		);
		const inserterMenuSelector = By.css( '.block-editor-inserter__menu' );
		await driverHelper.clickWhenClickable( this.driver, inserterCloseSelector );
		await driverHelper.waitTillNotPresent( this.driver, inserterMenuSelector );
	}

	/**
	 * Returns a list of titles for the block items currently shown in the main inserter.
	 *
	 * @returns {string[]} Array of block titles (i.e ['Open Table', 'Paypal']);
	 */
	async getShownBlockInserterItems() {
		return this.driver
			.findElements(
				By.css(
					'.edit-post-layout__inserter-panel .block-editor-block-types-list span.block-editor-block-types-list__item-title'
				)
			)
			.then( ( els ) => webdriver.promise.map( els, ( el ) => el.getAttribute( 'innerText' ) ) );
	}

	/**
	 * @typedef {Object} BlockSelectorSettings
	 * @property {string} title The block title as it appears in the inserter
	 * @property {string} blockClass The suffix that's part of a wrapper CSS class that's used to select the block button in the inserter.
	 * Calcualted from the title if not present.
	 * @property {string} prefix Also used to build the CSS class that's used t o select the block in the inserter.
	 * @property {string} ariaLabel The aria label text used to select the block element wrapper in the editor. Calculated from the title if not present.
	 * @property {boolean} initsWithChildFocus Whether or not the block gives focus to its first child upon being created/rendered in the editor.
	 */

	/**
	 * Returns an object with settings to be used to select the block button in
	 * the inserter or the actual block in the editor. This is used by @see {@link addBlock}
	 * to translate the title of a block into something it can use to select/find them.
	 *
	 * NOTE: In the future it'd be nice to return the actual block class (in `lib/gutenberg/blocks`) and move those attributes
	 * there instead of creating yet another value object, like it's being done now. We might then rethink or remove
	 * the @see {@link insertBlock} function, too.
	 *
	 * @param {string} title The block title.
	 * @returns {BlockSelectorSettings} the selector settings for the given block, to be used by {@link addBlock}.
	 */
	getBlockSelectorSettings( title ) {
		const defaultSettings = {
			title: title.charAt( 0 ).toUpperCase() + title.slice( 1 ), // Capitalize block name
			blockClass: kebabCase( title.toLowerCase() ),
			initsWithChildFocus: false,
		};

		let blockSettings;

		switch ( title ) {
			case 'Instagram':
			case 'Twitter':
			case 'YouTube':
				blockSettings = { ariaLabel: 'Block: Embed', prefix: 'embed-' };
				break;
			case 'Form':
				blockSettings = { prefix: 'jetpack-', blockClass: 'contact-form' };
				break;
			case 'Simple Payments':
			case 'Pay with PayPal':
				blockSettings = {
					ariaLabel: 'Block: Pay with PayPal',
					prefix: 'jetpack-',
					blockClass: 'simple-payments',
				};
				break;
			case 'Markdown':
				blockSettings = { prefix: 'jetpack-' };
				break;
			case 'Buttons':
			case 'Click to Tweet':
			case 'Hero':
			case 'Pricing Table':
				blockSettings = { prefix: 'coblocks-' };
				break;
			case 'Masonry':
				blockSettings = { prefix: 'coblocks-', blockClass: 'gallery-masonry' };
				break;
			case 'Logos':
				blockSettings = { prefix: 'coblocks-', blockClass: 'logos' };
				break;
			case 'Dynamic HR':
				blockSettings = { prefix: 'coblocks-', blockClass: 'dynamic-separator' };
				break;
			case 'Blog Posts':
				blockSettings = { prefix: 'a8c-' };
				break;
			case 'Subscription Form':
				blockSettings = { prefix: 'jetpack', blockClass: 'subscriptions' };
				break;
			case 'Layout Grid':
			case 'Tiled Gallery':
			case 'Contact Info':
			case 'Slideshow':
				blockSettings = { prefix: 'jetpack-' };
				break;
			case 'Star Rating':
				blockSettings = { prefix: 'jetpack-', blockClass: 'rating-star' };
				break;
		}

		return { ...defaultSettings, ...blockSettings };
	}
	// return blockID - top level block id which is looks like `block-b91ce479-fb2d-45b7-ad92-22ae7a58cf04`. Should be used for further interaction with added block.
	async addBlock( title ) {
		const { ariaLabel, prefix, blockClass, initsWithChildFocus } = this.getBlockSelectorSettings(
			title
		);

		const selectorAriaLabel = ariaLabel || `Block: ${ title }`;

		// TODO Remove the `deprecatedInserterBlockItemSelector` definition and usage after we activate GB 9.4.0 on production.
		const deprecatedInserterBlockItemSelector = `.edit-post-layout__inserter-panel .block-editor-inserter__block-list button.editor-block-list-item-${ prefix }${ blockClass }`;
		const inserterBlockItemSelector = By.css(
			`.edit-post-layout__inserter-panel .block-editor-block-types-list button.editor-block-list-item-${ prefix }${ blockClass }, ${ deprecatedInserterBlockItemSelector }`
		);

		let insertedBlockSelector = By.css(
			`.block-editor-block-list__block.${
				initsWithChildFocus ? 'has-child-selected' : 'is-selected'
			}[aria-label*='${ selectorAriaLabel }']`
		);

		// @TODO: Remove this condition when Gutenberg v9.1 is deployed for all sites.
		if ( title === 'Heading' ) {
			const deprecatedSelector = insertedBlockSelector.value.replace(
				selectorAriaLabel,
				'Write heading…'
			);
			insertedBlockSelector = By.css( `${ insertedBlockSelector.value }, ${ deprecatedSelector }` );
		}

		await this.openBlockInserterAndSearch( title );

		if ( await driverHelper.elementIsNotPresent( this.driver, inserterBlockItemSelector ) ) {
			await driverHelper.waitTillPresentAndDisplayed( this.driver, inserterBlockItemSelector );
		}

		// The normal click is needed to avoid hovering the element, which seems
		// to cause the element to become stale.
		await driverHelper.clickWhenClickable( this.driver, inserterBlockItemSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, insertedBlockSelector );

		return this.driver.findElement( insertedBlockSelector ).getAttribute( 'id' );
	}

	/**
	 * An alternative way of adding blocks to the editor by accepting the actual constructor
	 * class for the block, adding it to the editor, and returning an instance of this class.
	 *
	 * This allows for adding new blocks without the need to create new factory method in this class.
	 * You can just import the class of the block(s) you want to add and pass it to this function, which
	 * also means we don't need to couple the block class with this one.
	 *
	 * @param { Function } blockClass A block class
	 */
	async insertBlock( blockClass ) {
		const blockID = await this.addBlock( blockClass.blockTitle );
		return blockClass.Expect( this.driver, blockID );
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
		await imageBlock.uploadImage( fileDetails );

		return blockID;
	}

	async addFile( fileDetails ) {
		const blockID = await this.addBlock( 'File' );

		const fileBlock = await FileBlockComponent.Expect( this.driver, blockID );
		await fileBlock.uploadFile( fileDetails );

		return blockID;
	}

	async removeBlock( blockID ) {
		const blockSelector = By.css( `.wp-block[id="${ blockID }"]` );
		await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			blockSelector,
			this.explicitWaitMS / 5
		);
		await this.driver.findElement( blockSelector ).click();
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.block-editor-block-settings-menu' )
		);
		await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '.components-menu-group' ),
			this.explicitWaitMS / 5
		);
		await this.driver.sleep( 1000 );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				'.components-menu-group:last-of-type button.components-menu-item__button:last-of-type'
			)
		);
	}

	async addImageFromMediaModal( fileDetails ) {
		const blockId = await this.addBlock( 'Image' );

		const imageBlock = await ImageBlockComponent.Expect( this.driver, blockId );
		return await imageBlock.insertImageFromMediaModal( fileDetails );
	}

	async toggleSidebar( open = true ) {
		const sidebarSelector = '.interface-complementary-area-header';
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
				By.css( ".interface-complementary-area-header__small button[aria-label='Close settings']" )
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
			By.css( '.post-publish-panel__postpublish-header' )
		);
		return await driverHelper.verifyTextPresent(
			this.driver,
			By.css( '.post-publish-panel__postpublish-header' ),
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
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				'.edit-post-header .edit-post-fullscreen-mode-close, .edit-post-header-toolbar__back'
			)
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.wpcom-block-editor-nav-sidebar-nav-sidebar__home-button' )
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
		if (
			await driverHelper.isEventuallyPresentAndDisplayed(
				this.driver,
				welcomeModal,
				this.explicitWaitMS / 5
			)
		) {
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

	async clickUpgradeOnPremiumBlock() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css(
				'.jetpack-upgrade-plan-banner__wrapper .is-primary:not(.jetpack-upgrade-plan__hidden)'
			)
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				'.jetpack-upgrade-plan-banner__wrapper .is-primary:not(.jetpack-upgrade-plan__hidden)'
			)
		);
	}
}
