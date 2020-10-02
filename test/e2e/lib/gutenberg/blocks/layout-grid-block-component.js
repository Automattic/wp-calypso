/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class LayoutGridBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Layout Grid';
	static blockName = 'jetpack/layout-grid';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-jetpack-layout-grid' );
}

export { LayoutGridBlockComponent };
