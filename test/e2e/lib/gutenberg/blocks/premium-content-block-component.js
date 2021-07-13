import { By } from 'selenium-webdriver';
import GutenbergBlockComponent from './gutenberg-block-component';

class PremiumContentBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Premium Content';
	static blockName = 'premium-content/container';
	static blockFrontendLocator = By.css( '.entry-content .wp-block-premium-content-container' );
}

export { PremiumContentBlockComponent };
