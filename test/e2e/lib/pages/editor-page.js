/**
 * External dependencies
 */
import { By, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';
import * as dataHelper from '../data-helper';

import AsyncBaseContainer from '../async-base-container';
import NoticesComponent from '../components/notices-component';

export default class EditorPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = EditorPage._getUrl();
		}
		super( driver, By.css( '.post-editor' ), url );
		this.editorFrameName = By.css( '.mce-edit-area iframe' );
	}

	async _postInit() {
		const contentLocator = By.css( 'div.is-section-post-editor' );
		const cogLocator = By.css( 'button.editor-ground-control__toggle-sidebar' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, contentLocator );
		const contentElement = await this.driver.findElement( contentLocator );
		const classes = await contentElement.getAttribute( 'class' );
		if ( classes.indexOf( 'focus-content' ) < 0 ) {
			await driverHelper.clickWhenClickable( this.driver, cogLocator );
		}
		await this.waitForPage();
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			this.editorFrameName
		);
	}

	async enterTitle( blogPostTitle ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.editor-title__input' ),
			blogPostTitle
		);
	}

	async enterContent( blogPostText ) {
		await this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await this.driver.findElement( By.id( 'tinymce' ) ).sendKeys( blogPostText );
		return await this.driver.switchTo().defaultContent();
	}

	async chooseInsertMediaOption() {
		await driverHelper.clickWhenClickable( this.driver, By.css( '.mce-wpcom-insert-menu button' ) );
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( 'span[data-e2e-insert-type="media"]' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'span[data-e2e-insert-type="media"]' )
		);
	}

	async uploadMedia( fileDetails ) {
		const newFile = fileDetails.file;

		await this.chooseInsertMediaOption();
		await this.sendFile( newFile );
		return await this.driver.sleep( 1000 );
	}

	async sendFile( file ) {
		const fileNameInputLocator = By.css( '.media-library__upload-button input[type="file"]' );
		const driver = this.driver;

		await driverHelper.waitUntilElementLocatedAndVisible(
			driver,
			By.className( 'media-library__upload-button' )
		);
		const fileNameInput = await driver.findElement( fileNameInputLocator );
		await fileNameInput.sendKeys( file );
		await driverHelper.isElementNotLocated(
			driver,
			By.css( '.media-library__list-item.is-transient' )
		);
		const errorShown = await this.isErrorDisplayed();
		if ( errorShown ) {
			throw new Error( 'There is an error shown on the editor page!' );
		}
		return await driverHelper.waitUntilElementLocatedAndVisible(
			driver,
			By.css( '.media-library__list-item.is-selected' )
		);
	}

	async saveImage( fileName ) {
		const driver = this.driver;

		const imageUploadedLocator = By.css( 'img[alt="' + fileName + '"]' );
		await driverHelper.waitUntilElementLocatedAndVisible( driver, imageUploadedLocator );
		return await driverHelper.clickWhenClickable(
			driver,
			By.css( 'button[data-e2e-button="confirm"]' )
		);
	}

	async openImageDetails() {
		const editLocator = By.css( 'button[data-e2e-button="edit"]:not([disabled])' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, editLocator );
		return await driverHelper.clickWhenClickable( this.driver, editLocator );
	}

	async selectEditImage() {
		let editLocator = By.css( '.editor-media-modal-detail__edit:not([disabled])' );
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			editLocator = By.css( '.is-mobile .editor-media-modal-detail__edit:not([disabled])' );
		}
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, editLocator );
		return await driverHelper.clickWhenClickable( this.driver, editLocator );
	}

	async waitForImageEditor() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			'.image-editor__canvas.is-placeholder'
		);
	}

	async dismissImageEditor() {
		const cancelLocator = By.css( 'button[data-e2e-button="cancel"]:not([disabled])' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, cancelLocator );
		return await driverHelper.clickWhenClickable( this.driver, cancelLocator );
	}

	async dismissImageDetails() {
		const backLocator = By.css( '.editor-media-modal-detail .header-cake__back:not([disabled])' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, backLocator );
		return await driverHelper.clickWhenClickable( this.driver, backLocator );
	}

	async insertContactForm() {
		await driverHelper.clickWhenClickable( this.driver, By.css( '.mce-wpcom-insert-menu button' ) );
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'span[data-e2e-insert-type="contact-form"]' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button[data-e2e-button="save"]' )
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
		await driverHelper.clickWhenClickable( this.driver, By.css( '.mce-wpcom-insert-menu button' ) );
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'span[data-e2e-insert-type="payment-button"]' )
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				'.editor-simple-payments-modal__navigation .section-header__actions .gridicons-plus-small'
			)
		);
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.editor-simple-payments-modal__form #title' ),
			title
		);
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.editor-simple-payments-modal__form #description' ),
			description
		);
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.editor-simple-payments-modal__form #price' ),
			price
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css(
				`.editor-simple-payments-modal__form .form-currency-input__select option[value="${ currency }"]`
			)
		);
		if ( email ) {
			await driverHelper.setWhenSettable(
				this.driver,
				By.css( '.editor-simple-payments-modal__form #email' ),
				email
			);
		}
		if ( allowQuantity === true ) {
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.editor-simple-payments-modal__form .form-toggle__switch' )
			);
		}
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-simple-payments-modal button.is-primary' )
		);
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.editor-simple-payments-modal' ),
			this.explicitWaitMS * 7
		);
	}

	async enterPostImage( fileDetails ) {
		const newImageName = fileDetails.imageName;
		const newFile = fileDetails.file;

		await this.chooseInsertMediaOption();
		await this.sendFile( newFile );
		const imageUploadedLocator = By.css( 'img[alt="' + newImageName + '"]' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, imageUploadedLocator );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button[data-e2e-button="confirm"]' )
		);
	}

	async deleteMedia() {
		await driverHelper.clickWhenClickable( this.driver, By.css( '.editor-media-modal__delete' ) );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button[data-e2e-button="accept"]' )
		);
	}

	async dismissMediaModal() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button[data-e2e-button="cancel"]' )
		);
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.dialog__backdrop.is-full-screen' )
		);
	}

	async waitUntilImageInserted( fileDetails ) {
		const newImageName = fileDetails.imageName;
		await this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( 'img[alt="' + newImageName + '"]' )
		);
		return await this.driver.switchTo().defaultContent();
	}

	async waitUntilFeaturedImageInserted() {
		const driver = this.driver;

		await driverHelper.waitUntilElementLocatedAndVisible(
			driver,
			By.css( '.post-editor__inner-content .editor-featured-image__preview' )
		);
		await driverHelper.waitUntilElementLocatedAndVisible(
			driver,
			By.css( '[data-e2e-title="featured-image"] .editor-featured-image__preview img' )
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
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.wpview-type-contact-form' )
		);
		return await this.driver.switchTo().defaultContent();
	}

	async ensurePaymentButtonDisplayedInPost() {
		await this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.wpview-type-simple-payments' )
		);
		return await this.driver.switchTo().defaultContent();
	}

	async waitForTitle() {
		return await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( '.editor-title.is-loading' )
		);
	}

	async titleShown() {
		const titleLocator = By.css( '.editor-title__input' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, titleLocator );
		const element = await this.driver.findElement( titleLocator );
		return await element.getAttribute( 'value' );
	}

	async publishEnabled() {
		return await driverHelper.isElementLocated(
			this.driver,
			By.css( '.editor-publish-button:not([disabled])' )
		);
	}

	async postIsScheduled() {
		return await driverHelper.isElementLocated(
			this.driver,
			By.css(
				'.post-editor__inner .post-editor__content .editor-action-bar .editor-status-label.is-future'
			)
		);
	}

	static _getUrl() {
		return dataHelper.getCalypsoURL( 'post' );
	}
}
