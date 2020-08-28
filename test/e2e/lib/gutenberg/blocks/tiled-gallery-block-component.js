/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class TiledGalleryBlockComponent extends GutenbergBlockComponent {
	static get blockTitle() {
		return 'Tiled Gallery';
	}
	static get blockName() {
		return 'jetpack/tiled-gallery';
	}

	fileInputSelector = By.xpath(
		`//*[@id="${ this.blockID.slice( 1 ) }"]/div/div/div[3]/div[2]/input`
	);

	async uploadImages( filesDetails ) {
		const fileInput = this.driver.findElement( this.fileInputSelector );

		const files = filesDetails.map( ( f ) => f.file ).join( '\n ' );

		fileInput.sendKeys( files );
	}
}

export { TiledGalleryBlockComponent };
