/* eslint-disable jsdoc/check-tag-names */
/** @format */

const webdriver = require( 'selenium-webdriver' );

const driverHelper = require( '../driver-helper.js' );

const by = webdriver.By;
const until = webdriver.until;

const AsyncBaseContainer = require( '../async-base-container' );

class EditorPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.post-editor' ) );
		this.editorFrameName = by.css( '.mce-edit-area iframe' );
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

	async deleteMedia() {
		await driverHelper.clickWhenClickable( this.driver, by.css( '.editor-media-modal__delete' ) );
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button[data-e2e-button="accept"]' )
		);
	}

	async errorDisplayed() {
		await this.driver.sleep( 1000 );
		return await driverHelper.isElementPresent( this.driver, by.css( '.notice.is-error' ) );
	}
}

module.exports = EditorPage;
