/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';
import * as dataHelper from '../data-helper';

const by = webdriver.By;
const until = webdriver.until;

import AsyncBaseContainer from '../async-base-container';
import NoticesComponent from '../components/notices-component';

export default class EditorPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = EditorPage._getUrl();
		}
		super( driver, by.css( '.post-editor' ), url );
		this.editorFrameName = by.css( '.mce-edit-area iframe' );
	}

	async _postInit() {
		const contentSelector = by.css( 'div.is-section-post-editor' );
		const cogSelector = by.css( 'button.editor-ground-control__toggle-sidebar' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, contentSelector );
		const contentElement = await this.driver.findElement( contentSelector );
		const classes = await contentElement.getAttribute( 'class' );
		if ( classes.indexOf( 'focus-content' ) < 0 ) {
			await driverHelper.clickWhenClickable( this.driver, cogSelector );
		}
		await this.waitForPage();
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, this.editorFrameName );
	}

	async enterTitle( blogPostTitle ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-title__input' ),
			blogPostTitle
		);
	}

	async enterContent( blogPostText ) {
		await this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await this.driver.findElement( webdriver.By.id( 'tinymce' ) ).sendKeys( blogPostText );
		return await this.driver.switchTo().defaultContent();
	}

	async chooseInsertMediaOption() {
		await driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button' ) );
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( 'span[data-e2e-insert-type="media"]' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'span[data-e2e-insert-type="media"]' )
		);
	}

	async uploadMedia( fileDetails ) {
		const newFile = fileDetails.file;

		await this.chooseInsertMediaOption();
		await this.sendFile( newFile );
		return await this.driver.sleep( 1000 );
	}

	async sendFile( file ) {
		const fileNameInputSelector = webdriver.By.css(
			'.media-library__upload-button input[type="file"]'
		);
		const driver = this.driver;

		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			by.className( 'media-library__upload-button' )
		);
		const fileNameInput = await driver.findElement( fileNameInputSelector );
		await fileNameInput.sendKeys( file );
		await driverHelper.elementIsNotPresent(
			driver,
			by.css( '.media-library__list-item.is-transient' )
		);
		const errorShown = await this.isErrorDisplayed();
		if ( errorShown ) {
			throw new Error( 'There is an error shown on the editor page!' );
		}
		return await driverHelper.waitTillPresentAndDisplayed(
			driver,
			by.css( '.media-library__list-item.is-selected' )
		);
	}

	async saveImage( fileName ) {
		const driver = this.driver;

		const imageUploadedSelector = webdriver.By.css( 'img[alt="' + fileName + '"]' );
		await driverHelper.waitTillPresentAndDisplayed( driver, imageUploadedSelector );
		return await driverHelper.clickWhenClickable(
			driver,
			by.css( 'button[data-e2e-button="confirm"]' )
		);
	}

	async openImageDetails() {
		const editSelector = by.css( 'button[data-e2e-button="edit"]:not([disabled])' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, editSelector );
		return await driverHelper.clickWhenClickable( this.driver, editSelector );
	}

	async selectEditImage() {
		let editSelector = by.css( '.editor-media-modal-detail__edit:not([disabled])' );
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			editSelector = by.css( '.is-mobile .editor-media-modal-detail__edit:not([disabled])' );
		}
		await driverHelper.waitTillPresentAndDisplayed( this.driver, editSelector );
		return await driverHelper.clickWhenClickable( this.driver, editSelector );
	}

	async waitForImageEditor() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			'.image-editor__canvas.is-placeholder'
		);
	}

	async dismissImageEditor() {
		const cancelSelector = by.css( 'button[data-e2e-button="cancel"]:not([disabled])' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, cancelSelector );
		return await driverHelper.clickWhenClickable( this.driver, cancelSelector );
	}

	async dismissImageDetails() {
		const backSelector = by.css( '.editor-media-modal-detail .header-cake__back:not([disabled])' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, backSelector );
		return await driverHelper.clickWhenClickable( this.driver, backSelector );
	}

	async insertContactForm() {
		await driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button' ) );
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'span[data-e2e-insert-type="contact-form"]' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button[data-e2e-button="save"]' )
		);
	}

	async insertPaymentButton( {
		title = 'Button',
		description = 'Description',
		price = '1.00',
		currency = 'AUD',
		allowQuantity = true,
		email = 'test@wordpress.com',
	} = {} ) {
		await driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button' ) );
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'span[data-e2e-insert-type="payment-button"]' )
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css(
				'.editor-simple-payments-modal__navigation .section-header__actions .gridicons-plus-small'
			)
		);
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-simple-payments-modal__form #title' ),
			title
		);
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-simple-payments-modal__form #description' ),
			description
		);
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-simple-payments-modal__form #price' ),
			price
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css(
				`.editor-simple-payments-modal__form .form-currency-input__select option[value="${ currency }"]`
			)
		);
		if ( email ) {
			await driverHelper.setWhenSettable(
				this.driver,
				by.css( '.editor-simple-payments-modal__form #email' ),
				email
			);
		}
		if ( allowQuantity === true ) {
			await driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.editor-simple-payments-modal__form .form-toggle__switch' )
			);
		}
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.editor-simple-payments-modal button.is-primary' )
		);
		return await driverHelper.waitTillNotPresent(
			this.driver,
			by.css( '.editor-simple-payments-modal' ),
			this.explicitWaitMS * 7
		);
	}

	async enterPostImage( fileDetails ) {
		const newImageName = fileDetails.imageName;
		const newFile = fileDetails.file;

		await this.chooseInsertMediaOption();
		await this.sendFile( newFile );
		const imageUploadedSelector = webdriver.By.css( 'img[alt="' + newImageName + '"]' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, imageUploadedSelector );
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button[data-e2e-button="confirm"]' )
		);
	}

	async deleteMedia() {
		await driverHelper.clickWhenClickable( this.driver, by.css( '.editor-media-modal__delete' ) );
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button[data-e2e-button="accept"]' )
		);
	}

	async dismissMediaModal() {
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button[data-e2e-button="cancel"]' )
		);
		return await driverHelper.waitTillNotPresent(
			this.driver,
			by.css( '.dialog__backdrop.is-full-screen' )
		);
	}

	async waitUntilImageInserted( fileDetails ) {
		const newImageName = fileDetails.imageName;
		await this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( 'img[alt="' + newImageName + '"]' )
		);
		return await this.driver.switchTo().defaultContent();
	}

	async waitUntilFeaturedImageInserted() {
		const driver = this.driver;

		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			by.css( '.post-editor__inner-content .editor-featured-image__preview' )
		);
		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			by.css( '[data-e2e-title="featured-image"] .editor-featured-image__preview img' )
		);
		return await driver.switchTo().defaultContent();
	}

	async isErrorDisplayed() {
		const noticesComponent = await NoticesComponent.Expect( this.driver );
		return await noticesComponent.isErrorNoticeDisplayed();
	}

	async ensureContactFormDisplayedInPost() {
		await this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.wpview-type-contact-form' )
		);
		return await this.driver.switchTo().defaultContent();
	}

	async ensurePaymentButtonDisplayedInPost() {
		await this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.wpview-type-simple-payments' )
		);
		return await this.driver.switchTo().defaultContent();
	}

	async waitForTitle() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			by.css( '.editor-title.is-loading' )
		);
	}

	async titleShown() {
		const titleSelector = by.css( '.editor-title__input' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, titleSelector );
		const element = await this.driver.findElement( titleSelector );
		return await element.getAttribute( 'value' );
	}

	async publishEnabled() {
		return await driverHelper.isElementPresent(
			this.driver,
			by.css( '.editor-publish-button:not([disabled])' )
		);
	}

	async postIsScheduled() {
		return await driverHelper.isElementPresent(
			this.driver,
			by.css(
				'.post-editor__inner .post-editor__content .editor-action-bar .editor-status-label.is-future'
			)
		);
	}

	static _getUrl() {
		return dataHelper.getCalypsoURL( 'post' );
	}
}
