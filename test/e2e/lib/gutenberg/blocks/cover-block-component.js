/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export default class CoverBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Cover';

	async setTitleText( text ) {
		const paragraphLocator = By.css( `${ this.blockID } p.block-editor-rich-text__editable` );
		await driverHelper.waitUntilLocatedAndVisible( this.driver, paragraphLocator );
		const paragraphElement = await this.driver.findElement( paragraphLocator );
		await paragraphElement.sendKeys( text );
	}

	async getImageSrc() {
		const imgElement = await this.driver.findElement(
			By.css( `${ this.blockID } img.wp-block-cover__image-background` )
		);
		return ( await imgElement.getAttribute( 'src' ) ) || '';
	}
}
