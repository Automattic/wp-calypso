/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class DynamicSeparatorBlockComponent extends GutenbergBlockComponent {
	static get blockTitle() {
		return 'Dynamic HR';
	}
	static get blockName() {
		return 'coblocks/dynamic-separator';
	}
}

export { DynamicSeparatorBlockComponent };
