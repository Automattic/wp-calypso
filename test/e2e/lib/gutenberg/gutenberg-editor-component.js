import { kebabCase } from 'lodash';
import webdriver, { By } from 'selenium-webdriver';
import AbstractEditorComponent from '../components/abstract-editor-component';
import GuideComponent from '../components/guide-component.js';
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager.js';
import { ContactFormBlockComponent } from './blocks';
import { FileBlockComponent } from './blocks/file-block-component';
import { ImageBlockComponent } from './blocks/image-block-component';
import { ShortcodeBlockComponent } from './blocks/shortcode-block-component';

export default class GutenbergEditorComponent extends AbstractEditorComponent {
	constructor( driver, url, editorType = 'iframe' ) {
		super( driver, By.css( '.edit-post-header' ), url );
		this.editorType = editorType;

		this.editoriFrameLocator = By.css( '.calypsoify.is-iframe iframe.is-loaded' );
		this.publishHeaderLocator = By.css( '.editor-post-publish-panel__header' );
		this.prePublishButtonLocator = By.css(
			'.editor-post-publish-panel__toggle[aria-disabled="false"]'
		);
		this.publishButtonLocator = By.css(
			'.editor-post-publish-panel__header-publish-button button.editor-post-publish-button'
		);
		this.publishingSpinnerLocator = By.css(
			'.editor-post-publish-panel__content .components-spinner'
		);
		this.closePublishPanelButtonLocator = By.css(
			'.editor-post-publish-panel__header button[aria-label="Close panel"]'
		);
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
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, this.editoriFrameLocator );
	}

	async initEditor( { dismissPageTemplateLocator = false } = {} ) {
		if ( dismissPageTemplateLocator ) {
			await this.dismissPageTemplateLocator();
		}
		const editorWelcomeModal = new GuideComponent( this.driver );
		await editorWelcomeModal.dismiss( 4000 );
		return await this.closeSidebar();
	}

	async publish( { visit = false, addNew = false, waitForNavigation = true } = {} ) {
		await driverHelper.clickWhenClickable( this.driver, this.prePublishButtonLocator );
		await driverHelper.clickWhenClickable( this.driver, this.publishButtonLocator );

		const publishedPostLinkLocator = By.css( '.post-publish-panel__postpublish-header a' );
		const addNewPostLinkLocator = By.css(
			'.post-publish-panel__postpublish-buttons [href*="post-new.php"]'
		);
		const publishedPostLinkElement = await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			publishedPostLinkLocator
		);

		const publishedPostLinkUrl = await publishedPostLinkElement.getAttribute( 'href' );

		if ( visit ) {
			await driverHelper.clickWhenClickable( this.driver, publishedPostLinkLocator );
			if ( waitForNavigation ) {
				await driverHelper.waitUntilElementLocatedAndVisible( this.driver, By.css( '#page' ) );
			}
		} else if ( addNew ) {
			await driverHelper.clickWhenClickable( this.driver, addNewPostLinkLocator );
			if ( waitForNavigation ) {
				await driverHelper.waitUntilElementLocatedAndVisible( this.driver, By.css( '#page' ) );
			}
		} else {
			// Close the panel if we're not visiting the published page or starting a new post
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( 'button[aria-label="Close panel"]' )
			);
		}

		return publishedPostLinkUrl;
	}

	async update( { visit = false } = {} ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.editor-post-publish-button' )
		);

		if ( visit ) {
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.components-snackbar__content a' )
			);
			await driverHelper.waitUntilElementLocatedAndVisible( this.driver, By.css( '#page' ) );
		}
	}

	async enterTitle( title ) {
		const titleLocator = By.css( '.editor-post-title__input' );
		return await driverHelper.setWhenSettable( this.driver, titleLocator, title );
	}

	async getTitle() {
		return await this.driver
			.findElement( By.css( '.editor-post-title__input' ) )
			.getAttribute( 'value' );
	}

	async enterText( text ) {
		const appenderLocator = By.css( '.block-editor-default-block-appender' );
		const paragraphLocator = By.css( 'p.block-editor-rich-text__editable:first-of-type' );
		await driverHelper.clickWhenClickable( this.driver, appenderLocator );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, paragraphLocator );
		const paragraphElement = await this.clearText( paragraphLocator );
		await paragraphElement.sendKeys( text );

		return paragraphElement;
	}

	async clearText( locator ) {
		const paragraphElement = await this.driver.findElement( locator );
		const text = await paragraphElement.getText();
		let i = text.length;
		while ( i > 0 ) {
			await paragraphElement.sendKeys( webdriver.Key.BACK_SPACE );
			i--;
		}
		return paragraphElement;
	}

	async getContent() {
		return await this.driver.findElement( By.css( '.block-editor-block-list__layout' ) ).getText();
	}

	async replaceTextOnLastParagraph( text ) {
		const paragraphLocator = By.css( 'p.block-editor-rich-text__editable:first-of-type' );
		const paragraphElement = await this.clearText( paragraphLocator );
		await paragraphElement.sendKeys( text );

		return paragraphElement;
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
			By.css( ".edit-post-more-menu button[aria-label='Options']" )
		);

		// This sleep is needed for the Options menu to be accessible. I've tried `waitUntilElementLocatedAndVisible`
		// but it doesn't seem to work consistently, but this is pending improvement as this adds up on total time.
		await this.driver.sleep( 2000 );
	}

	async switchToCodeEditor() {
		await this.toggleOptionsMenu();

		await driverHelper.clickWhenClickable(
			this.driver,
			By.xpath(
				"//div[@aria-label='Options']//button[text()='Code editor']|//button[./span='Code editor']"
			)
		);

		// Wait for the code editor element.
		const textAreaLocator = By.css( 'textarea.editor-post-text-editor' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, textAreaLocator );

		// Close the menu.
		await this.toggleOptionsMenu();

		return textAreaLocator;
	}

	async exitCodeEditor() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.xpath( "//button[text()='Exit code editor']" )
		);
	}

	async getBlocksCode() {
		const textAreaLocator = await this.switchToCodeEditor();
		const blocksCode = this.driver.findElement( textAreaLocator ).getAttribute( 'value' );
		await this.exitCodeEditor();

		return blocksCode;
	}

	async setBlocksCode( blocksCode ) {
		const textAreaLocator = await this.switchToCodeEditor();
		await driverHelper.setWhenSettable( this.driver, textAreaLocator, blocksCode );
		await this.exitCodeEditor();
	}

	async blockDisplayedInEditor( dataTypeLocatorVal ) {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( `[data-type="${ dataTypeLocatorVal }"]` )
		);
	}

	async contactFormDisplayedInEditor() {
		return await this.blockDisplayedInEditor( 'jetpack/contact-form' );
	}

	async hasInvalidBlocks() {
		return await driverHelper.isElementLocated( this.driver, By.css( '.block-editor-warning' ) );
	}

	async isBlockInserterOpen() {
		const inserterMenuLocator = By.css( '.block-editor-inserter__menu' );
		return await driverHelper.isElementLocated( this.driver, inserterMenuLocator );
	}

	async openBlockInserter() {
		const inserterToggleLocator = By.css(
			'.edit-post-header .edit-post-header-toolbar__inserter-toggle'
		);
		if ( ! ( await this.isBlockInserterOpen() ) ) {
			await driverHelper.clickWhenClickable( this.driver, inserterToggleLocator );
		}

		const inserterMenuLocator = By.css( '.block-editor-inserter__menu' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, inserterMenuLocator );
	}

	async insertPattern( category, name ) {
		await this.openBlockInserter();

		const patternTabLocator = By.css(
			'.block-editor-inserter__tabs .components-tab-panel__tabs-item[id$="patterns"]'
		);
		const patternCategoryDropdownLocator = By.css(
			'.components-tab-panel__tab-content .components-select-control__input'
		);
		const patternCategoryDropdownOptionLocator = By.css(
			`.components-tab-panel__tab-content .components-select-control__input option[value="${ category }"]`
		);
		const patternItemLocator = By.css(
			`.block-editor-block-patterns-list__list-item[aria-label="${ name }"]`
		);
		await driverHelper.clickWhenClickable( this.driver, patternTabLocator );
		await driverHelper.clickWhenClickable( this.driver, patternCategoryDropdownLocator );
		await driverHelper.clickWhenClickable( this.driver, patternCategoryDropdownOptionLocator );
		await driverHelper.clickWhenClickable( this.driver, patternCategoryDropdownLocator );
		await driverHelper.clickWhenClickable( this.driver, patternItemLocator );
	}

	// @TODO: Remove `.block-editor-inserter__results .components-panel__body-title` selector in favor of the `.block-editor-inserter__block-list .block-editor-inserter__panel-title` selector when Gutenberg 8.0.0 is deployed.
	async isBlockCategoryPresent( name ) {
		const categoryLocator =
			'.block-editor-inserter__results .components-panel__body-title, .block-editor-inserter__block-list .block-editor-inserter__panel-title';
		const categoryName = await this.driver.findElement( By.css( categoryLocator ) ).getText();
		return categoryName.toLowerCase() === name.toLowerCase();
	}

	async closeBlockInserter() {
		const inserterCloseLocator = By.css(
			driverManager.currentScreenSize() === 'mobile'
				? '.edit-post-editor__inserter-panel-header .components-button'
				: '.edit-post-header-toolbar__inserter-toggle'
		);
		const inserterMenuLocator = By.css( '.block-editor-inserter__menu' );
		await driverHelper.clickWhenClickable( this.driver, inserterCloseLocator );
		await driverHelper.waitUntilElementNotLocated( this.driver, inserterMenuLocator );
	}

	/**
	 * Returns a list of titles for the block items currently shown in the main inserter.
	 *
	 * @returns {string[]} Array of block titles (i.e ['Open Table', 'Paypal']);
	 */
	async getShownBlockInserterItems() {
		return await this.driver
			.findElements(
				By.css(
					'.edit-post-editor__inserter-panel .block-editor-block-types-list span.block-editor-block-types-list__item-title'
				)
			)
			.then( ( els ) => webdriver.promise.map( els, ( el ) => el.getAttribute( 'innerText' ) ) );
	}

	/**
	 * @typedef {Object} BlockLocatorSettings
	 * @property {string} title The block title as it appears in the inserter
	 * @property {string} blockClass The suffix that's part of a wrapper CSS class that's used to select the block button in the inserter.
	 * Calcualted from the title if not present.
	 * @property {string} prefix Also used to build the CSS class that's used to select the block in the inserter.
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
	 * @returns {BlockLocatorSettings} the selector settings for the given block, to be used by {@link addBlock}.
	 */
	getBlockLocatorSettings( title ) {
		const defaultSettings = {
			title: title.charAt( 0 ).toUpperCase() + title.slice( 1 ), // Capitalize block name
			blockClass: kebabCase( title.toLowerCase() ),
			initsWithChildFocus: false,
			ariaLabel: `Block: ${ title }`,
			prefix: '',
		};

		let blockSettings;

		switch ( title ) {
			case 'Instagram':
			case 'Twitter':
			case 'YouTube':
				blockSettings = { ariaLabel: 'Block: Embed', prefix: 'embed\\/' };
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
				blockSettings = { prefix: 'jetpack-', blockClass: 'subscriptions' };
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
			case 'Premium Content':
				blockSettings = { blockClass: 'premium-content-container' };
				break;
		}

		return { ...defaultSettings, ...blockSettings };
	}
	// return blockID - top level block id which is looks like `block-b91ce479-fb2d-45b7-ad92-22ae7a58cf04`. Should be used for further interaction with added block.
	async addBlock( title ) {
		const { ariaLabel, prefix, blockClass, initsWithChildFocus } = this.getBlockLocatorSettings(
			title
		);

		const inserterBlockItemLocator = By.css(
			`.edit-post-editor__inserter-panel .block-editor-block-types-list button.editor-block-list-item-${ prefix }${ blockClass }`
		);

		const insertedBlockLocator = By.css(
			`.block-editor-block-list__block.${
				initsWithChildFocus ? 'has-child-selected' : 'is-selected'
			}[aria-label*='${ ariaLabel }']`
		);

		await this.openBlockInserterAndSearch( title );

		if ( await driverHelper.isElementNotLocated( this.driver, inserterBlockItemLocator ) ) {
			await driverHelper.waitUntilElementLocatedAndVisible( this.driver, inserterBlockItemLocator );
		}

		// The normal click is needed to avoid hovering the element, which seems
		// to cause the element to become stale.
		await driverHelper.clickWhenClickable( this.driver, inserterBlockItemLocator );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, insertedBlockLocator );

		return await this.driver.findElement( insertedBlockLocator ).getAttribute( 'id' );
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
		const titleLocator = By.css( '.editor-post-title__input' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, titleLocator );
		const element = await this.driver.findElement( titleLocator );
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
		const blockLocator = By.css( `.wp-block[id="${ blockID }"]` );
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			blockLocator,
			this.explicitWaitMS / 5
		);
		await this.driver.findElement( blockLocator ).click();
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.block-editor-block-settings-menu' )
		);
		await driverHelper.waitUntilElementLocatedAndVisible(
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
		const sidebarLocator = '.interface-complementary-area-header';
		const sidebarOpen = await driverHelper.isElementLocated(
			this.driver,
			By.css( sidebarLocator )
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
		return await driverHelper.clickWhenClickable(
			this.driver,
			this.closePublishPanelButtonLocator
		);
	}

	async ensureSaved() {
		await driverHelper.clickWhenClickable( this.driver, By.css( '.editor-post-save-draft' ) );
		const savedLocator = By.css( 'span.is-saved' );

		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, savedLocator );
	}

	async waitForSuccessViewPostNotice() {
		const noticeLocator = By.css( '.components-snackbar' );
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, noticeLocator );
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
		const revertToDraftButtonLocator = By.css( 'button.editor-post-switch-to-draft' );
		const enabledPublishButtonLocator = By.css(
			'button.editor-post-publish-button__button[aria-disabled="false"]'
		);

		await driverHelper.clickWhenClickable( this.driver, revertToDraftButtonLocator );
		await driverHelper.acceptAlertIfPresent( this.driver );
		await driverHelper.waitUntilElementNotLocated( this.driver, revertToDraftButtonLocator );
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			enabledPublishButtonLocator
		);
	}

	async viewPublishedPostOrPage() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.components-snackbar__content a' )
		);
		await this.driver.switchTo().defaultContent();
	}

	async schedulePost( publishDate ) {
		await driverHelper.clickWhenClickable( this.driver, this.prePublishButtonLocator );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, this.publishHeaderLocator );
		const publishDateLocator = driverHelper.createTextLocator(
			By.css( '.editor-post-publish-panel__link' ),
			publishDate
		);
		await driverHelper.waitUntilElementLocated( this.driver, publishDateLocator );
		await driverHelper.clickWhenClickable( this.driver, this.publishButtonLocator );
		await driverHelper.waitUntilElementNotLocated( this.driver, this.publishingSpinnerLocator );
		const scheduleDateLocator = driverHelper.createTextLocator(
			By.css( '.post-publish-panel__postpublish-header' ),
			/scheduled/i
		);
		await driverHelper.waitUntilElementLocated( this.driver, scheduleDateLocator );
	}

	async closeScheduledPanel() {
		const publishCloseButtonLocator = By.css(
			'.editor-post-publish-panel__header > .components-button'
		);
		return await driverHelper.clickWhenClickable( this.driver, publishCloseButtonLocator );
	}

	async submitForReview() {
		await driverHelper.clickWhenClickable( this.driver, this.prePublishButtonLocator );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, this.publishHeaderLocator );
		return await driverHelper.clickWhenClickable( this.driver, this.publishButtonLocator );
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

	async dismissPageTemplateLocator() {
		if ( await driverHelper.isElementLocated( this.driver, By.css( '.page-pattern-modal' ) ) ) {
			if ( driverManager.currentScreenSize() === 'mobile' ) {
				// For some reason, when the screensize is set to mobile,
				// the welcome guide modal is not closed when the template button
				// is clicked, causing the test to fail with a timeout.
				//
				// The same doesn't seem to happen if I run the test
				// in the Desktop screen size, but resize to a mobileish size.
				// For this reason, when in the mobile screen size, we force-close
				// the welcome modal before trying to click the template selector.
				await driverHelper.clickIfPresent(
					this.driver,
					By.css( '.edit-post-welcome-guide button[aria-label="Close dialog"]' )
				);
				await driverHelper.clickWhenClickable(
					this.driver,
					By.css( 'button.page-pattern-modal__blank-button' )
				);
			} else {
				const useBlankButton = await this.driver.findElement(
					By.css( 'button.page-pattern-modal__blank-button' )
				);
				await this.driver.executeScript( 'arguments[0].click()', useBlankButton );
			}
		}
	}

	async clickUpgradeOnPremiumBlock() {
		await driverHelper.waitUntilElementLocatedAndVisible(
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

	async toggleListView() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-post-header-toolbar__list-view-toggle' )
		);
	}

	async toggleDetails() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-post-header .table-of-contents button' )
		);
	}

	async toggleBlockEditorSidebar() {
		const dismissSidebarButtonSelector =
			'button[aria-label="Block editor sidebar"][aria-expanded="false"]';
		const toggleSidebarButtonSelector = 'button[aria-label="Close block editor sidebar"]';

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `${ toggleSidebarButtonSelector }, ${ dismissSidebarButtonSelector }` )
		);
	}

	async dismissNotices() {
		const locator = By.css( '.components-snackbar[aria-label="Dismiss this notice"]' );
		const notices = await this.driver.findElements( locator );
		await Promise.all( notices.map( ( notice ) => notice.click() ) );
		await driverHelper.waitUntilElementNotLocated( this.driver, locator );
	}
}
