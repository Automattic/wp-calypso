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
		const inputLocator = By.css( `${ this.blockID } textarea.wp-block-jetpack-markdown__editor` );

		return await driverHelper.setWhenSettable( this.driver, inputLocator, content );
	}

	async revealToolbar() {
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			this.expectedElementLocator
		);
		await driverHelper.clickWhenClickable( this.driver, By.css( '.editor-post-title' ) );
		return await driverHelper.clickWhenClickable( this.driver, this.expectedElementLocator );
	}

	async switchMarkdown() {
		const inputLocator = By.css( `${ this.blockID } textarea.wp-block-jetpack-markdown__editor` );
		return await this._switchMode( inputLocator );
	}

	async switchPreview() {
		const previewLocator = By.css( `${ this.blockID } .wp-block-jetpack-markdown__preview` );
		return await this._switchMode( previewLocator );
	}

	// Caution! make sure you in preview mode before calling this.
	async getPreviewHTML() {
		const previewLocator = By.css( `${ this.blockID } .wp-block-jetpack-markdown__preview` );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, previewLocator );
		return await this.driver.findElement( previewLocator ).getAttribute( 'innerHTML' );
	}

	async _switchMode( expectedLocator ) {
		await this.revealToolbar();
		const isVisible = await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			expectedLocator,
			1000
		);
		if ( isVisible ) {
			return true;
		}
		const switchLocator = By.css(
			`${ this.blockID } button.components-tab-button:not(.is-active)`
		);
		await driverHelper.clickWhenClickable( this.driver, switchLocator );
		return await driverHelper.waitUntilElementLocatedAndVisible( this.driver, expectedLocator );
	}
}
