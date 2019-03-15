/** @format */

import assert from 'assert';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class ImportPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.importer__shell' ) );
	}

	async previewSiteToBeImported() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.site-importer__site-preview' )
		);

		const isSitePreviewShowing = await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '.mini-site-preview__favicon' )
		);

		assert( isSitePreviewShowing, 'Site preview should be shown' );
	}

	async siteImporterInputPane() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.site-importer__site-importer-pane' )
		);
	}

	async siteImporterCanStartImport() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.site-importer__site-preview-confirm-button' )
		);
	}
}
