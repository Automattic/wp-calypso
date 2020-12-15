/**
 * External dependencies
 */

import { By, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

export default class SiteEditorComponent extends AsyncBaseContainer {
	constructor( driver, url, editorType = 'iframe' ) {
		super( driver, By.css( '.edit-site-header' ), url );
		this.editorType = editorType;

		this.editoriFrameSelector = By.css( '.calypsoify.is-iframe iframe' );
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

	async waitForTemplatePartsToLoad() {
		await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.wp-block-template-part .components-spinner' )
		);
	}

	async waitForTemplateToLoad( templateName = 'Front Page' ) {
		await driverHelper.getElementByText(
			this.driver,
			By.css( '.edit-site-document-actions__title' ),
			templateName
		);

		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.edit-site-block-editor__block-list' )
		);
	}
}
