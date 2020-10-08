/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
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
	 * @param {{imageName: string, fileName: string, file: string}[]} filesDetails a list of fileDetails
	 */
	async uploadImages( filesDetails ) {
		const fileInputSelector = By.css( `${ this.blockID } input[type=file]` );
		const files = filesDetails.map( ( f ) => f.file ).join( '\n ' );

		await driverHelper.setWhenSettable( this.driver, fileInputSelector, files );
	}
}

export { GalleryMasonryBlockComponent };
