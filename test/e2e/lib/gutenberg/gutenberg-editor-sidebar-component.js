/**
 * External dependencies
 */
import { By, Key } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';
import * as driverManager from '../driver-manager';
import * as SlackNotifier from '../slack-notifier';
import GutenbergEditorComponent from './gutenberg-editor-component';

export default class GutenbergEditorSidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.edit-post-header' ) );
	}

	async selectTab( ...names ) {
		if ( ! names.length ) {
			throw new Error( 'No tab name provided.' );
		}
		const by = By.css(
			names.map( ( name ) => `.edit-post-sidebar__panel-tab[aria-label^=${ name }]` ).join()
		);
		await driverHelper.scrollIntoView( this.driver, by );
		await driverHelper.clickWhenClickable( this.driver, by );
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.components-panel' )
		);
	}

	async selectDocumentTab() {
		// Recent versions of Gutenberg use "Post" or "Page"
		// Older versions use "Document"
		// @TODO: Remove "Document"
		await this.selectTab( 'Post', 'Page', 'Document' );
	}

	async selectBlockTab() {
		await this.selectTab( 'Block' );
	}

	async expandStatusAndVisibility() {
		return await this._expandOrCollapseSectionByText( 'Status & visibility', true );
	}

	async expandPermalink() {
		return await this._expandOrCollapseSectionByText( 'Permalink', true );
	}

	async expandCategories() {
		return await this._expandOrCollapseSectionByText( 'Categories', true );
	}

	async expandTags() {
		return await this._expandOrCollapseSectionByText( 'Tags', true );
	}

	async expandFeaturedImage() {
		return await this._expandOrCollapseSectionByText( 'Featured image', true );
	}

	async expandExcerpt() {
		return await this._expandOrCollapseSectionByText( 'Excerpt', true );
	}

	async expandDiscussion() {
		return await this._expandOrCollapseSectionByText( 'Discussion', true );
	}

	async collapseStatusAndVisibility() {
		return await this._expandOrCollapseSectionByText( 'Status & visibility', false );
	}

	async collapsePermalink() {
		return await this._expandOrCollapseSectionByText( 'Permalink', false );
	}

	async collapseCategories() {
		return await this._expandOrCollapseSectionByText( 'Categories', false );
	}

	async collapseTags() {
		return await this._expandOrCollapseSectionByText( 'Tags', false );
	}

	async collapseFeaturedImage() {
		return await this._expandOrCollapseSectionByText( 'Featured Image', false );
	}

	async collapseExcerpt() {
		return await this._expandOrCollapseSectionByText( 'Excerpt', false );
	}

	async collapseDiscussion() {
		return await this._expandOrCollapseSectionByText( 'Discussion', false );
	}

	async _expandOrCollapseSectionByText( text, expand = true ) {
		const sectionLocator = driverHelper.createTextLocator(
			By.css( '.components-panel__body-toggle' ),
			text
		);
		const sectionButton = await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			sectionLocator
		);
		const c = await sectionButton.getAttribute( 'aria-expanded' );
		if ( expand && c === 'false' ) {
			await driverHelper.scrollIntoView( this.driver, sectionLocator );
			return await sectionButton.click();
		}
		if ( ! expand && c === 'true' ) {
			await driverHelper.scrollIntoView( this.driver, sectionLocator );
			return await sectionButton.click();
		}
	}

	async setCommentsPreference( { allow = true } = {} ) {
		const labelLocator = driverHelper.createTextLocator(
			By.css( '.components-checkbox-control__label' ),
			'Allow comments'
		);
		const checkBoxSelector = await this.driver.findElement( labelLocator ).getAttribute( 'for' );
		const checkBoxLocator = By.id( checkBoxSelector );

		await driverHelper.setCheckbox( this.driver, checkBoxLocator, allow );
	}

	async addNewCategory( category ) {
		const addNewCategoryButtonLocator = By.css( '.editor-post-taxonomies__hierarchical-terms-add' );
		const categoryNameInputLocator = By.css(
			'input.editor-post-taxonomies__hierarchical-terms-input[type=text]'
		);
		const saveCategoryButtonLocator = By.css(
			'button.editor-post-taxonomies__hierarchical-terms-submit'
		);
		const driver = this.driver;

		await driverHelper.clickWhenClickable( driver, addNewCategoryButtonLocator );
		await driverHelper.setWhenSettable( driver, categoryNameInputLocator, category );
		await driverHelper.clickWhenClickable( driver, saveCategoryButtonLocator );
		return await driverHelper.waitUntilElementLocatedAndVisible(
			driver,
			By.xpath( `//label[contains(text(), '${ category }')]` )
		);
	}

	async addNewTag( tag ) {
		const tagEntryLocator = By.css( 'input.components-form-token-field__input' );

		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, tagEntryLocator );
		await driverHelper.scrollIntoView( this.driver, tagEntryLocator );
		const tagInput = await driverHelper.setWhenSettable( this.driver, tagEntryLocator, tag );
		await tagInput.sendKeys( Key.ENTER );
	}

	async tagEventuallyDisplayed( tag ) {
		const locator = By.xpath( `//span[text()='${ tag }']` );
		return await driverHelper.isElementEventuallyLocatedAndVisible( this.driver, locator );
	}

	async _postInit() {
		return await this.displayComponentIfNecessary();
	}

	async displayComponentIfNecessary() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			return await gEditorComponent.openSidebar();
		}
	}

	async hideComponentIfNecessary() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
			return await gEditorComponent.closeSidebar();
		}
	}

	async chooseDocumentSettings() {
		const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
		await gEditorComponent.openSidebar();
		return this.selectDocumentTab();
	}

	async chooseBlockSettings() {
		const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
		await gEditorComponent.openSidebar();
		return this.selectBlockTab();
	}

	async setVisibilityToPasswordProtected( password ) {
		const visibilityToggleLocator = By.css( '.edit-post-post-visibility__toggle' );
		const visibilityOptionLocator = By.css( 'input#editor-post-password-0[value="password"]' );
		const passwordInputLocator = By.css( '.editor-post-visibility__dialog-password-input' );

		await driverHelper.clickWhenClickable( this.driver, visibilityToggleLocator );
		await driverHelper.clickWhenClickable( this.driver, visibilityOptionLocator );
		await driverHelper.setWhenSettable( this.driver, passwordInputLocator, password, {
			secureValue: true,
		} );
	}

	async setVisibilityToPrivate() {
		const visibilityToggleLocator = By.css( '.edit-post-post-visibility__toggle' );
		const visibilityOptionLocator = By.css( 'input#editor-post-private-0[value="private"]' );

		await driverHelper.clickWhenClickable( this.driver, visibilityToggleLocator );
		await driverHelper.clickWhenClickable( this.driver, visibilityOptionLocator );
		await driverHelper.waitUntilAlertPresent( this.driver );
		await driverHelper.acceptAlertIfPresent( this.driver );
	}

	async scheduleFuturePost() {
		await this.expandStatusAndVisibility();
		const nextMonthLocator = By.css( '.DayPickerNavigation_rightButton__horizontalDefault' );
		const firstDayLocator = driverHelper.createTextLocator( By.css( '.CalendarDay' ), '1' );
		const publishDateLocator = By.css( '.edit-post-post-schedule__toggle' );

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-post-post-schedule__toggle' )
		);
		// schedulePost post for the first day of the next month
		await driverHelper.clickWhenClickable( this.driver, nextMonthLocator );
		await driverHelper.clickWhenClickable( this.driver, firstDayLocator );
		// Add another click so the calendar modal disappears and makes space for
		// the follow-up clicks. This is because of a bug reported in
		// https://github.com/WordPress/gutenberg/issues/30415 and can be reverted
		// once an upstream fix is in.
		await driverHelper.clickWhenClickable( this.driver, firstDayLocator );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, publishDateLocator );
		const publishDate = await this.driver.findElement( publishDateLocator ).getText();

		if ( driverManager.currentScreenSize() === 'mobile' ) {
			await this.hideComponentIfNecessary();
		}
		return publishDate;
	}

	async getSelectedPublishDate() {
		const publishDateLocator = By.css( '.edit-post-post-schedule__toggle' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, publishDateLocator );
		return await this.driver.findElement( publishDateLocator ).getText();
	}

	async trashPost() {
		const trashLocator = By.css( 'button.editor-post-trash' );

		await this.selectDocumentTab();
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, trashLocator );
		await driverHelper.clickWhenClickable( this.driver, trashLocator );

		// wait for 'Move to trash' button to disappear
		try {
			return await driverHelper.waitUntilElementNotLocated(
				this.driver,
				trashLocator,
				this.explicitWaitMS * 3
			);
		} catch ( e ) {
			// if it's still present send slack notification, post is deleted
			return await SlackNotifier.warn(
				'"Move to trash" button is still present, but post is deleted.',
				{
					suppressDuplicateMessages: true,
				}
			);
		}
	}

	async enterImageAltText( fileDetails ) {
		const altTextInputLocator = By.css( '.components-textarea-control__input' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, altTextInputLocator );
		return await driverHelper.setWhenSettable(
			this.driver,
			altTextInputLocator,
			fileDetails.imageName
		);
	}

	async openRevisionsDialog() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-post-last-revision__panel' )
		);
	}

	async openFeaturedImageDialog() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-featured-image__container button' )
		);
	}

	async removeFeaturedImage() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-featured-image button.is-destructive' )
		);
	}
}
