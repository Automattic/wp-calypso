/**
 * External dependencies
 */
import { By, Key, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import AsyncBaseContainer from '../async-base-container';

export default class PostEditorSidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.editor-sidebar' ) );
		this.publicizeMessageSelector = By.css( 'div.editor-sharing__message-input textarea' );
		this.visibilitySelector = By.css( '.editor-sidebar .editor-visibility__dropdown' );
	}

	async _postInit() {
		return await this.displayComponentIfNecessary();
	}

	async displayComponentIfNecessary() {
		const driver = this.driver;
		const contentSelector = By.css( 'div.is-section-post-editor' );
		const cogSelector = By.css( 'button.editor-ground-control__toggle-sidebar' );
		await driverHelper.waitTillPresentAndDisplayed( driver, contentSelector );
		const c = await driver.findElement( contentSelector ).getAttribute( 'class' );
		if ( c.indexOf( 'focus-sidebar' ) < 0 ) {
			return await driverHelper.clickWhenClickable( driver, cogSelector );
		}
	}

	async hideComponentIfNecessary() {
		const driver = this.driver;
		const contentSelector = By.css( 'div.is-section-post-editor' );
		const cogSelector = By.css( 'button.editor-ground-control__toggle-sidebar' );
		await driverHelper.waitTillPresentAndDisplayed( driver, contentSelector );
		const c = await driver.findElement( contentSelector ).getAttribute( 'class' );
		if ( c.indexOf( 'focus-sidebar' ) !== -1 ) {
			return await driverHelper.clickWhenClickable( driver, cogSelector );
		}
	}

	async expandCategoriesAndTags() {
		return await this._expandOrCollapseSection( 'categories-tags', true );
	}

	async closeCategoriesAndTags() {
		return await this._expandOrCollapseSection( 'categories-tags', false );
	}

	async expandSharingSection() {
		return await this._expandOrCollapseSection( 'sharing', true );
	}

	async closeSharingSection() {
		return await this._expandOrCollapseSection( 'sharing', false );
	}

	async expandStatusSection() {
		return await this._expandOrCollapseSection( 'status', true );
	}

	async closeStatusSection() {
		return await this._expandOrCollapseSection( 'status', false );
	}

	async expandMoreOptions() {
		return await this._expandOrCollapseSection( 'more-options', true );
	}

	async closeMoreOptions() {
		return await this._expandOrCollapseSection( 'more-options', false );
	}

	async expandFeaturedImage() {
		return await this._expandOrCollapseSection( 'featured-image', true );
	}

	async closeFeaturedImage() {
		return await this._expandOrCollapseSection( 'featured-image', false );
	}

	async expandPageOptions() {
		return await this._expandOrCollapseSection( 'page-options', true );
	}

	async closePageOptions() {
		return await this._expandOrCollapseSection( 'page-options', false );
	}

	async expandPostFormat() {
		return await this._expandOrCollapseSection( 'post-format', true );
	}

	async addNewCategory( category ) {
		const addNewCategoryButtonSelector = By.css(
			'div.editor-categories-tags__accordion button.button'
		);
		const categoryNameInputSelector = By.css( 'div.dialog__content input[type=text]' );
		const saveCategoryButtonSelector = By.css( 'div.dialog__action-buttons button.is-primary' );
		const driver = this.driver;

		await driverHelper.waitTillPresentAndDisplayed( driver, addNewCategoryButtonSelector );
		await driverHelper.clickWhenClickable( driver, addNewCategoryButtonSelector );
		await driverHelper.waitForFieldClearable( driver, categoryNameInputSelector );
		await driverHelper.waitTillFocused( driver, categoryNameInputSelector );
		await driverHelper.setWhenSettable( driver, categoryNameInputSelector, category );
		await driverHelper.clickWhenClickable( driver, saveCategoryButtonSelector );
		return await driverHelper.waitTillNotPresent( driver, saveCategoryButtonSelector );
	}

	async getCategoriesAndTags() {
		const categoriesAndTagsSelector = By.css(
			'.editor-categories-tags__accordion span.accordion__subtitle'
		);

		await driverHelper.waitTillPresentAndDisplayed( this.driver, categoriesAndTagsSelector );
		return await this.driver.findElement( categoriesAndTagsSelector ).getText();
	}

	async addNewTag( tag ) {
		const tagEntrySelector = By.css( 'input.token-field__input' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, tagEntrySelector );
		await driverHelper.scrollIntoView( this.driver, tagEntrySelector );
		await driverHelper.waitForFieldClearable( this.driver, tagEntrySelector );
		const tagEntryElement = await this.driver.findElement( tagEntrySelector );
		await tagEntryElement.sendKeys( tag );
		return await tagEntryElement.sendKeys( Key.ENTER );
	}

	async setCommentsForPost( allow = true ) {
		const driver = this.driver;
		const selector = By.css( 'input[name=comment_status]' );
		await driverHelper.waitTillPresentAndDisplayed( driver, selector );
		const enabled = await driver.findElement( selector ).isEnabled();
		if ( ( allow && ! enabled ) || ( ! allow && enabled ) ) {
			return await driverHelper.clickWhenClickable( driver, selector );
		}
	}

	async publicizeToTwitterAccountDisplayed() {
		const twitterAccountSelector = By.css( 'span[data-e2e-service="Twitter"]' );
		await this.driver.wait(
			until.elementLocated( twitterAccountSelector ),
			this.explicitWaitMS,
			'Could not locate a twitter account configured to share'
		);
		return await this.driver.findElement( twitterAccountSelector ).getText();
	}

	async publicizeMessagePlaceholder() {
		return await this.driver
			.findElement( this.publicizeMessageSelector )
			.getAttribute( 'placeholder' );
	}

	async publicizeMessageDisplayed() {
		return await this.driver.findElement( this.publicizeMessageSelector ).getAttribute( 'value' );
	}

	async setPublicizeMessage( message ) {
		await driverHelper.setWhenSettable( this.driver, this.publicizeMessageSelector, message );
		// This seems to help with https://github.com/Automattic/wp-calypso/issues/38697
		return this.driver
			.findElement( By.css( '.editor-sharing__publicize-options-description' ) )
			.click();
	}

	async setSharingButtons( allow = true ) {
		const driver = this.driver;
		const selector = By.css( 'input[name=sharing_enabled]' );
		const enabled = await driver.findElement( selector ).isEnabled();
		if ( ( allow && ! enabled ) || ( ! allow && enabled ) ) {
			return await driverHelper.clickWhenClickable( driver, selector );
		}
	}

	async revertToDraft() {
		const revertDraftSelector = By.css( 'button.edit-post-status__revert-to-draft' );
		await this._expandOrCollapseSection( 'status', true );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, revertDraftSelector );
		return await driverHelper.clickWhenClickable( this.driver, revertDraftSelector );
	}

	async setVisibilityToPrivate() {
		const driver = this.driver;
		const valueSelector = By.css(
			'.editor-sidebar a.select-dropdown__item[data-bold-text="private"]'
		);

		await this._expandOrCollapseSection( 'status', true );
		await driverHelper.clickWhenClickable( driver, this.visibilitySelector );
		await driverHelper.clickWhenClickable( driver, valueSelector );
		return await driverHelper.clickWhenClickable( driver, By.css( '.dialog button.is-primary' ) ); //Click Yes to publish
	}

	async setVisibilityToPasswordProtected( password ) {
		const driver = this.driver;
		const valueSelector = By.css(
			'.editor-sidebar a.select-dropdown__item[data-bold-text="password"]'
		);
		const passwordEntrySelector = By.css( '.editor-sidebar .editor-fieldset input[type="text"]' );

		await this._expandOrCollapseSection( 'status', true );
		await driverHelper.clickWhenClickable( driver, this.visibilitySelector );
		await driverHelper.clickWhenClickable( driver, valueSelector );
		return await driverHelper.setWhenSettable( driver, passwordEntrySelector, password, {
			secureValue: true,
		} );
	}

	async trashPost() {
		const trashSelector = By.css( 'button.editor-delete-post__button' );
		const confirmationSelector = By.css( 'button[data-e2e-button="accept"]' );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, trashSelector );
		await driverHelper.clickWhenClickable( this.driver, trashSelector );

		await driverHelper.clickWhenClickable( this.driver, confirmationSelector );
		return await driverHelper.waitTillNotPresent( this.driver, confirmationSelector );
	}

	async openFeaturedImageDialog() {
		const setButtonSelector = By.css(
			'[data-e2e-title="featured-image"] .editor-drawer-well__placeholder'
		);
		await driverHelper.waitTillPresentAndDisplayed( this.driver, setButtonSelector );
		return await driverHelper.clickWhenClickable( this.driver, setButtonSelector );
	}

	async removeFeaturedImage() {
		const removeButtonSelector = By.css( '[data-e2e-title="featured-image"] button.remove-button' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, removeButtonSelector );
		return await driverHelper.clickWhenClickable( this.driver, removeButtonSelector );
	}

	// Selects the first day of the second week of next month - to (hopefully) always select a future date on the calendar
	async chooseFutureDate() {
		const nextMonthSelector = By.css( '.date-picker__next-month' );
		const firstDayOfSecondWeekSelector = By.css(
			'.DayPicker-Body .DayPicker-Week:nth-of-type(2) .DayPicker-Day'
		);
		await this._openClosePostDateSelector( { shouldOpen: true } );
		await driverHelper.clickWhenClickable( this.driver, nextMonthSelector );
		return await driverHelper.clickWhenClickable( this.driver, firstDayOfSecondWeekSelector );
	}

	async getSelectedPublishDate() {
		const publishDateSelector = By.css( '.edit-post-status .editor-publish-date__header-chrono' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, publishDateSelector );
		return await this.driver.findElement( publishDateSelector ).getText();
	}

	async _openClosePostDateSelector( { shouldOpen = true } = {} ) {
		const self = this;
		const postDateDropdownSelector = By.css( '.editor-sidebar .editor-publish-date' );
		await driverHelper.waitTillPresentAndDisplayed( self.driver, postDateDropdownSelector );
		const elementClasses = await this.driver
			.findElement( postDateDropdownSelector )
			.getAttribute( 'class' );
		const currentlyOpen = elementClasses.indexOf( 'is-open' ) > -1;
		if ( ( shouldOpen && ! currentlyOpen ) || ( ! shouldOpen && currentlyOpen ) ) {
			return await driverHelper.clickWhenClickable( self.driver, postDateDropdownSelector );
		}
	}

	async _expandOrCollapseSection( sectionName, expand = true ) {
		const headerSelector = By.css( `div[data-e2e-title="${ sectionName }"]` );
		const toggleSelector = By.css(
			`div[data-e2e-title="${ sectionName }"] button.accordion__toggle`
		);
		const driver = this.driver;

		await driverHelper.waitTillPresentAndDisplayed( driver, headerSelector );
		const c = await driver.findElement( headerSelector ).getAttribute( 'class' );
		if ( expand && c.indexOf( 'is-expanded' ) < 0 ) {
			await driverHelper.scrollIntoView( driver, toggleSelector );
			return await driverHelper.clickWhenClickable( driver, toggleSelector );
		}
		if ( ! expand && c.indexOf( 'is-expanded' ) > -1 ) {
			await driverHelper.scrollIntoView( driver, toggleSelector );
			return await driverHelper.clickWhenClickable( driver, toggleSelector );
		}
	}
}
