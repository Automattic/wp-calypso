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
}

export { SlideshowBlockComponent };
