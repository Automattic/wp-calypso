/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

export class TiledGalleryBlockComponent extends GutenbergBlockComponent {
	constructor( driver, blockID ) {
		super( driver, blockID );
	}

	async uploadImages( filesDetails ) {
		const fileInput = this.driver.findElement(
			By.xpath( `//*[@id="${ this.blockID.slice( 1 ) }"]/div/div/div[3]/div[2]/input` )
		);

		const files = filesDetails.map( ( f ) => f.file ).join( '\n ' );

		fileInput.sendKeys( files );
	}
}
