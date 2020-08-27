/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class SlideshowBlockComponent extends GutenbergBlockComponent {
	static get blockTitle() {
		return 'Slideshow';
	}
	static get blockName() {
		return 'jetpack/slideshow';
	}
}

export { SlideshowBlockComponent };
