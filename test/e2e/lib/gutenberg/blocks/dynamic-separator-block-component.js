/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class DynamicSeparatorBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Dynamic HR';
	static blockName = 'coblocks/dynamic-separator';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-coblocks-dynamic-separator' );
}

export { DynamicSeparatorBlockComponent };
