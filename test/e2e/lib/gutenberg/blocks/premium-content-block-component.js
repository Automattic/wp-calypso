/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class PremiumContentBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Premium Content';
	static blockName = 'premium-content/container';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-premium-content-container' );
}

export { PremiumContentBlockComponent };
