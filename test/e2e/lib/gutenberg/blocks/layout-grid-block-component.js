/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class LayoutGridBlockComponent extends GutenbergBlockComponent {
	static get blockTitle() {
		return 'Layout Grid';
	}
	static get blockName() {
		return 'jetpack/layout-grid';
	}
}

export { LayoutGridBlockComponent };
