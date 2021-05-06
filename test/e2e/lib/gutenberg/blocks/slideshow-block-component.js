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
	static blockFrontendLocator = By.css( '.entry-content .wp-block-jetpack-slideshow' );

	/**
	 * Uploads images to the slideshow.
	 *
	 * @param {{imageName: string, fileName: string, file: string}[]} filesDetails a list of fileDetails
	 */
	async uploadImages( filesDetails ) {
		const fileInputLocator = By.css( `${ this.blockID } input[type="file"]` );
		const fileInputElement = await this.driver.findElement( fileInputLocator );
		const files = filesDetails.map( ( f ) => f.file ).join( '\n ' );

		await fileInputElement.sendKeys( files );
	}
}

export { SlideshowBlockComponent };
