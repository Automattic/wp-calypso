/**
 * External dependencies
 */

import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

export default class SiteEditorComponent extends AsyncBaseContainer {
	constructor( driver, url, editorType = 'iframe' ) {
		super( driver, By.css( '.edit-site-header' ), url );
		this.editorType = editorType;

		this.editoriFrameLocator = By.css( '.calypsoify.is-iframe iframe' );
		this.editorCanvasiFrameLocator = By.css( 'iframe[name="editor-canvas"]' );
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
		await this.driver.sleep( 2000 );
	}

	async _postInit() {
		await this.driver.sleep( 2000 );
	}

	async runInCanvas( fn ) {
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, this.editorCanvasiFrameLocator );
		await fn();
		await this.driver.switchTo().parentFrame();
	}

	async waitForTemplatePartsToLoad() {
		await this.runInCanvas( async () => {
			await driverHelper.waitUntilElementNotLocated(
				this.driver,
				By.css( '.wp-block-template-part .components-spinner' )
			);
		} );
	}

	async waitForTemplateToLoad() {
		await this.runInCanvas( () =>
			driverHelper.waitUntilElementLocatedAndVisible(
				this.driver,
				By.css( '.edit-site-block-editor__block-list' )
			)
		);
	}
}
