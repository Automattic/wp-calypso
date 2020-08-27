/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class TiledGalleryBlockComponent extends GutenbergBlockComponent {
	async uploadImages( filesDetails ) {
		const fileInput = this.driver.findElement(
			By.xpath( `//*[@id="${ this.blockID.slice( 1 ) }"]/div/div/div[3]/div[2]/input` )
		);

		const files = filesDetails.map( ( f ) => f.file ).join( '\n ' );

		fileInput.sendKeys( files );
	}
}

TiledGalleryBlockComponent.blockTitle = 'Tiled Gallery';
TiledGalleryBlockComponent.blockName = 'jetpack/tiled-gallery';

export { TiledGalleryBlockComponent };
