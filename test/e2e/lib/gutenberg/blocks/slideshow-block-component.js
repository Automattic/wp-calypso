/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class SlideshowBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Slideshow';
	static blockName = 'jetpack/slideshow';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-jetpack-slideshow' );

	/**
	 * Uploads images to the slideshow.
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

export { SlideshowBlockComponent };
