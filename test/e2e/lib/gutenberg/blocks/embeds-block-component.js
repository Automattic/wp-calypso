/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export default class EmbedsBlockComponent extends GutenbergBlockComponent {
	async embedUrl( url ) {
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( `${ this.blockID } .components-placeholder__input` ),
			url
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `${ this.blockID } .wp-block-embed .components-button` )
		);
		await driverHelper.waitUntilElementNotLocated(
			this.driver,
			By.css( `${ this.blockID } .wp-block-image .components-spinner` )
		);
	}

	async isEmbedDisplayed( name ) {
		const selector = {
			YouTube: '.wp-block-embed iframe[title="Embedded content from youtube.com"]',
			Instagram: '.wp-block-embed iframe[title="Embedded content from instagram.com"]',
			Twitter: '.wp-block-embed iframe[title="Embedded content from twitter"]',
		}[ name ];

		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( `${ this.blockID } ${ selector }` )
		);
	}
}
