/** @format */

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
		this.cogSelector = By.css( '[aria-label="Settings"]:not([disabled])' );
		this.closeSelector = By.css( '[aria-label="Close settings"]:not([disabled])' );
	}

	async selectTab( name ) {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `.edit-post-sidebar__panel-tab[aria-label^=${ name }]` )
		);
	}
	async selectDocumentTab() {
		await this.selectTab( 'Document' );
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.components-panel' )
		);
	}

	async expandStatusAndVisibility() {
		return await this._expandOrCollapseSectionByText( 'Status & Visibility', true );
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
		return await this._expandOrCollapseSectionByText( 'Featured Image', true );
	}

	async expandExcerpt() {
		return await this._expandOrCollapseSectionByText( 'Excerpt', true );
	}

	async expandDiscussion() {
		return await this._expandOrCollapseSectionByText( 'Discussion', true );
	}

	async collapseStatusAndVisibility() {
		return await this._expandOrCollapseSectionByText( 'Status & Visibility', false );
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
		const sectionSelector = await driverHelper.getElementByText(
			this.driver,
			By.css( '.components-panel__body-toggle' ),
			text
		);
		await driverHelper.waitTillPresentAndDisplayed( this.driver, sectionSelector );
		const sectionButton = await this.driver.findElement( sectionSelector );
		const c = await sectionButton.getAttribute( 'aria-expanded' );
		if ( expand && c === 'false' ) {
			await driverHelper.scrollIntoView( this.driver, sectionSelector );
			return await sectionButton.click();
		}
		if ( ! expand && c === 'true' ) {
			await driverHelper.scrollIntoView( this.driver, sectionSelector );
			return await sectionButton.click();
		}
	}

	async setCommentsPreference( { allow = true } = {} ) {
		const labelSelector = await driverHelper.getElementByText(
			this.driver,
			By.css( '.components-checkbox-control__label' ),
			'Allow Comments'
		);
		const checkBoxSelectorID = await this.driver.findElement( labelSelector ).getAttribute( 'for' );
		const checkBoxSelector = By.id( checkBoxSelectorID );
		if ( allow === true ) {
			await driverHelper.setCheckbox( this.driver, checkBoxSelector );
		} else {
			await driverHelper.unsetCheckbox( this.driver, checkBoxSelector );
		}
	}

	async addNewCategory( category ) {
		const addNewCategoryButtonSelector = By.css(
			'.editor-post-taxonomies__hierarchical-terms-add'
		);
		const categoryNameInputSelector = By.css(
			'input.editor-post-taxonomies__hierarchical-terms-input[type=text]'
		);
		const saveCategoryButtonSelector = By.css(
			'button.editor-post-taxonomies__hierarchical-terms-submit'
		);
		const driver = this.driver;

		await driverHelper.clickWhenClickable( driver, addNewCategoryButtonSelector );
		await driverHelper.waitForFieldClearable( driver, categoryNameInputSelector );

		await driverHelper.setWhenSettable( driver, categoryNameInputSelector, category );
		await driverHelper.clickWhenClickable( driver, saveCategoryButtonSelector );
		return await driverHelper.waitTillPresentAndDisplayed(
			driver,
			By.xpath( `//label[contains(text(), '${ category }')]` )
		);
	}

	async addNewTag( tag ) {
		const tagEntrySelector = By.css( 'input.components-form-token-field__input' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, tagEntrySelector );
		await driverHelper.scrollIntoView( this.driver, tagEntrySelector );
		await driverHelper.waitForFieldClearable( this.driver, tagEntrySelector );
		const tagEntryElement = await this.driver.findElement( tagEntrySelector );
		await tagEntryElement.sendKeys( tag );
		return await tagEntryElement.sendKeys( Key.ENTER );
	}

	async tagEventuallyDisplayed( tag ) {
		const selector = await driverHelper.getElementByText( this.driver, By.css( 'span' ), tag );
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	async _postInit() {
		return await this.displayComponentIfNecessary();
	}

	async displayComponentIfNecessary() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			const driver = this.driver;
			const c = await driver.findElement( this.cogSelector ).getAttribute( 'class' );
			if ( c.indexOf( 'is-toggled' ) < 0 ) {
				return await driverHelper.clickWhenClickable( driver, this.cogSelector );
			}
		}
	}

	async hideComponentIfNecessary() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			const driver = this.driver;

			const c = await driver.findElement( this.cogSelector ).getAttribute( 'class' );
			if ( c.indexOf( 'is-toggled' ) > -1 ) {
				return await driverHelper.clickWhenClickable( driver, this.closeSelector );
			}
		}
	}

	async chooseDocumentSettings() {
		const gEditorComponent = await GutenbergEditorComponent.Expect( this.driver );
		await gEditorComponent.openSidebar();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '[aria-label^="Document settings"], [data-label^="Document"]' )
		);
	}

	async setVisibilityToPasswordProtected( password ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-post-post-visibility__toggle' )
		);
		await driverHelper.selectElementByText(
			this.driver,
			By.css( '.editor-post-visibility__dialog-label' ),
			'Password Protected'
		);
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.editor-post-visibility__dialog-password-input' ),
			password,
			{
				secureValue: true,
			}
		);
	}

	async setVisibilityToPrivate() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-post-post-visibility__toggle' )
		);
		await driverHelper.selectElementByText(
			this.driver,
			By.css( '.editor-post-visibility__dialog-label' ),
			'Private'
		);
		const publishPrivateAlert = await this.driver.switchTo().alert();
		return await publishPrivateAlert.accept();
	}

	async scheduleFuturePost() {
		const nextMonthSelector = By.css( '.DayPickerNavigation_rightButton__horizontalDefault' );
		const firstDay = By.css( '.CalendarDay' );
		const publishDateSelector = By.css( '.edit-post-post-schedule__toggle' );

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.edit-post-post-schedule__toggle' )
		);
		// schedulePost post for the first day of the next month
		await driverHelper.clickWhenClickable( this.driver, nextMonthSelector );
		await driverHelper.selectElementByText( this.driver, firstDay, '1' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, publishDateSelector );
		const publishDate = await this.driver.findElement( publishDateSelector ).getText();

		if ( driverManager.currentScreenSize() === 'mobile' ) {
			await this.hideComponentIfNecessary();
		}
		return publishDate;
	}

	async getSelectedPublishDate() {
		const publishDateSelector = By.css( '.edit-post-post-schedule__toggle' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, publishDateSelector );
		return await this.driver.findElement( publishDateSelector ).getText();
	}

	async trashPost() {
		const trashSelector = By.css( 'button.editor-post-trash' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, trashSelector );
		await driverHelper.clickWhenClickable( this.driver, trashSelector );

		// wait for 'Move to trash' button to disappear
		try {
			return await driverHelper.waitTillNotPresent(
				this.driver,
				trashSelector,
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
		const altTextInputSelector = By.css( '.components-textarea-control__input' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, altTextInputSelector );
		return await driverHelper.setWhenSettable(
			this.driver,
			altTextInputSelector,
			fileDetails.imageName
		);
	}
}
