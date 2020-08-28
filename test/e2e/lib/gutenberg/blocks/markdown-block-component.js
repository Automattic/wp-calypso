/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export default class MarkdownBlockComponent extends GutenbergBlockComponent {
	async setContent( content ) {
		const inputSelector = By.css( `${ this.blockID } textarea.wp-block-jetpack-markdown__editor` );

		await driverHelper.waitTillPresentAndDisplayed( this.driver, inputSelector );
		return await driverHelper.setWhenSettable( this.driver, inputSelector, content );
	}

	async revealToolbar() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.expectedElementSelector );
		await driverHelper.clickWhenClickable( this.driver, By.css( '.editor-post-title' ) );
		return await driverHelper.clickWhenClickable( this.driver, this.expectedElementSelector );
	}

	async switchMarkdown() {
		const inputSelector = By.css( `${ this.blockID } textarea.wp-block-jetpack-markdown__editor` );
		return await this._switchMode( inputSelector );
	}

	async switchPreview() {
		const previewSelector = By.css( `${ this.blockID } .wp-block-jetpack-markdown__preview` );
		return await this._switchMode( previewSelector );
	}

	// Caution! make sure you in preview mode before calling this.
	async getPreviewHTML() {
		const previewSelector = By.css( `${ this.blockID } .wp-block-jetpack-markdown__preview` );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, previewSelector );
		return await this.driver.findElement( previewSelector ).getAttribute( 'innerHTML' );
	}

	async _switchMode( expectedSelector ) {
		await this.revealToolbar();
		const isVisible = await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			expectedSelector,
			1000
		);
		if ( isVisible ) {
			return true;
		}
		const switchSelector = By.css(
			`${ this.blockID } button.components-tab-button:not(.is-active)`
		);
		await driverHelper.clickWhenClickable( this.driver, switchSelector );
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, expectedSelector );
	}
}
