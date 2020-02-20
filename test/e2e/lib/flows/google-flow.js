/**
 * Internal dependencies
 */
import * as driverManager from '../driver-manager.js';

import GoogleAdPreviewTool from '../pages/external/google-ad-preview-tool.js';

export default class GoogleFlow {
	constructor( driver ) {
		this.driver = driver;
	}

	async resize( screenSize ) {
		if ( screenSize === undefined ) {
			this.screenSize = await driverManager.currentScreenSize();
		} else {
			await driverManager.resizeBrowser( this.driver, screenSize );
			this.screenSize = screenSize;
		}
	}

	async search( params ) {
		const screenSize = this.screenSize;
		this.GoogleAdPreviewTool = await GoogleAdPreviewTool.Visit(
			this.driver,
			GoogleAdPreviewTool.getURL( screenSize, params.domain, params.location, params.query )
		);
		await this.driver.takeScreenshot();
		return await this.GoogleAdPreviewTool.getSearchPageUrl();
	}
}
