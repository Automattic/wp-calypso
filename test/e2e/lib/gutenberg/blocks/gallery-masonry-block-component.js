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
}

export { GalleryMasonryBlockComponent };
