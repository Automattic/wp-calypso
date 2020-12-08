/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class RatingStarBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Star Rating';
	static blockName = 'jetpack/rating-star';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-jetpack-rating-star' );
}

export { RatingStarBlockComponent };
