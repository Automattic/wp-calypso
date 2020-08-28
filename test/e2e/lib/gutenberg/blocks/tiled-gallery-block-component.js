/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class TiledGalleryBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Tiled Gallery';
	static blockName = 'jetpack/tiled-gallery';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-jetpack-tiled-gallery' );

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
