/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class GalleryMasonryBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Masonry';
	static blockName = 'coblocks/gallery-masonry';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-coblocks-gallery-masonry' );

	/**
	 * Uploads images to the gallery.
	 *
	 * NOTE/TODO This is common to a few gallery-like blocks. DRY it using a mixin or common base class.
	 *
	 * @param {{imageName: string, fileName: string, file: string}} filesDetails a list of fileDetails
	 */
	async uploadImages( filesDetails ) {
		// TODO Simplify this selector, given the block ID, a simpler CSS selector will work here
		const fileInputSelector = By.css( `div[id="${ this.blockID.slice( 1 ) }"] input[type=file]` );

		const fileInput = this.driver.findElement( fileInputSelector );

		const files = filesDetails.map( ( f ) => f.file ).join( '\n ' );

		fileInput.sendKeys( files );
	}
}

export { GalleryMasonryBlockComponent };
