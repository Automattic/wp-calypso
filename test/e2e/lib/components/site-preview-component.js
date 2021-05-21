/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

class SitePreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.preview.main' ) );
	}

	async sitePreviewToolbar() {
		return await this.driver.findElement( By.css( '.web-preview__toolbar' ) );
	}

	async contentPlaceholder() {
		return await this.driver.findElement( By.css( '.web-preview__placeholder' ) );
	}

	async enterSitePreview() {
		const iFrameLocator = By.css( '.web-preview__frame' );

		await this.driver.switchTo().defaultContent();
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.css( '.web-preview__inner.is-visible.is-loaded' )
		);
		return await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, iFrameLocator );
	}

	async leaveSitePreview() {
		if ( this.screenSize === 'mobile' ) {
			await this.driver.switchTo().defaultContent();
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.button.web-preview__close' )
			);
		}

		return await this.driver.switchTo().defaultContent();
	}

	async siteBody() {
		return await this.driver.findElement( By.css( 'body.home' ) );
	}
}

export default SitePreviewComponent;
