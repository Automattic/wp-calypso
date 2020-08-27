/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class RatingStarBlockComponent extends GutenbergBlockComponent {
	static get blockTitle() {
		return 'Star Rating';
	}
	static get blockName() {
		return 'jetpack/rating-star';
	}
}

export { RatingStarBlockComponent };
