import { By } from 'selenium-webdriver';
import GutenbergBlockComponent from './gutenberg-block-component.js';

class RatingStarBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Star Rating';
	static blockName = 'jetpack/rating-star';
	static blockFrontendLocator = By.css( '.entry-content .wp-block-jetpack-rating-star' );
}

export { RatingStarBlockComponent };
