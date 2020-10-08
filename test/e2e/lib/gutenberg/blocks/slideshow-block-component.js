/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

class SlideshowBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Slideshow';
	static blockName = 'jetpack/slideshow';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-jetpack-slideshow' );

	/**
	 * Uploads images to the slideshow.
	 *
	 * @param {{imageName: string, fileName: string, file: string}[]} filesDetails a list of fileDetails
	 */
	async uploadImages( filesDetails ) {
		const fileInputSelector = By.css( `${ this.blockID } input[type=file]` );
		const files = filesDetails.map( ( f ) => f.file ).join( '\n ' );

		await driverHelper.setWhenSettable( this.driver, fileInputSelector, files );
	}
}

export { SlideshowBlockComponent };
