/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class YoutubeBlockComponent extends GutenbergBlockComponent {
	static get blockTitle() {
		return 'YouTube';
	}
	static get blockName() {
		return 'core-embed/youtube';
	}
}

export { YoutubeBlockComponent };
