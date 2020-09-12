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

	/**
	 * Uploads images to the gallery.
	 *
	 * @param {{imageName: string, fileName: string, file: string}} filesDetails a list of fileDetails
	 */
	async uploadImages( filesDetails ) {
		// TODO Simplify this selector, given the block ID, a simpler CSS selector will work here
		const fileInputSelector = By.xpath(
			`//*[@id="${ this.blockID.slice( 1 ) }"]/div/div/div[3]/div[2]/input`
		);

		const fileInput = this.driver.findElement( fileInputSelector );

		const files = filesDetails.map( ( f ) => f.file ).join( '\n ' );

		fileInput.sendKeys( files );
	}
}

export { TiledGalleryBlockComponent };
