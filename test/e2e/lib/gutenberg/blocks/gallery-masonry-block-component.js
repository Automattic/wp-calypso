/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class GalleryMasonryBlockComponent extends GutenbergBlockComponent {
	static get blockTitle() {
		return 'Masonry';
	}
	static get blockName() {
		return 'coblocks/gallery-masonry';
	}
}

export { GalleryMasonryBlockComponent };
