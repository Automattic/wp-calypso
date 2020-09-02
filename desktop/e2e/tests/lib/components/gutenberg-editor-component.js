/**
 * External dependencies
 */
const webdriver = require( 'selenium-webdriver' );

/**
 * Internal dependencies
 */
const driverHelper = require( '../driver-helper' );
const AsyncBaseContainer = require( '../async-base-container' );

const By = webdriver.By;
const until = webdriver.until;

class GutenbergEditorComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.edit-post-header' ) );

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

	async enterTitle( title ) {
		const titleFieldSelector = By.css( '.editor-post-title__input' );
		await driverHelper.clearTextArea( this.driver, titleFieldSelector );
		return await this.driver.findElement( titleFieldSelector ).sendKeys( title );
	}

	async enterText( text ) {
		const appenderSelector = By.css( '.block-editor-default-block-appender' );
		const paragraphSelector = By.css( 'p.block-editor-rich-text__editable:first-of-type' );
		await driverHelper.clickWhenClickable( this.driver, appenderSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, paragraphSelector );
		return await this.driver.findElement( paragraphSelector ).sendKeys( text );
	}

	async errorDisplayed() {
		await this.driver.sleep( 1000 );
		return await driverHelper.isElementPresent( this.driver, By.css( '.editor-error-boundary' ) );
	}

	async dismissPageTemplateSelector() {
		if ( await driverHelper.isElementPresent( this.driver, By.css( '.page-template-modal' ) ) ) {
			const useBlankButton = await this.driver.findElement(
				By.css( '.page-template-modal__buttons .components-button.is-primary' )
			);
			await this.driver.executeScript( 'arguments[0].click()', useBlankButton );
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
			// eslint-disable-next-line no-undef
			await this.driver.findElement( By.css( '.components-guide' ) ).sendKeys( Key.ESCAPE );
		}
	}

	async ensureSaved() {
		await driverHelper.clickWhenClickable( this.driver, By.css( '.editor-post-save-draft' ) );
		const savedSelector = By.css( 'span.is-saved' );

		return await driverHelper.waitTillPresentAndDisplayed( this.driver, savedSelector );
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
			await this.closePublishedPanel();
		}
		await this.waitForSuccessViewPostNotice();
		const url = await this.driver.findElement( snackBarNoticeLinkSelector ).getAttribute( 'href' );

		if ( visit ) {
			const snackbar = await this.driver.findElement( snackBarNoticeLinkSelector );
			await this.driver.executeScript( 'arguments[0].click();', snackbar );
		}
		return url;
	}

	async closePublishedPanel() {
		const closeButton = await this.driver.findElement(
			By.css( '.editor-post-publish-panel__header button[aria-label="Close panel"]' )
		);
		return await this.driver.executeScript( 'arguments[0].click();', closeButton );
	}

	async waitForSuccessViewPostNotice() {
		const noticeSelector = By.css( '.components-snackbar' );
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, noticeSelector );
	}

	async launchPreview() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.components-button.editor-post-preview' ),
			this.explicitWaitMS
		);
	}
}

module.exports = GutenbergEditorComponent;
