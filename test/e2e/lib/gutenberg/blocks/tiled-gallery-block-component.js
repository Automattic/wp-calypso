import { By } from 'selenium-webdriver';
import GutenbergBlockComponent from './gutenberg-block-component';

class TiledGalleryBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Tiled Gallery';
	static blockName = 'jetpack/tiled-gallery';
	static blockFrontendLocator = By.css( '.entry-content .wp-block-jetpack-tiled-gallery' );

	/**
	 * Uploads images to the gallery.
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

export { TiledGalleryBlockComponent };
