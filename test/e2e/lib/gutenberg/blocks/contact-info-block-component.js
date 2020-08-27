/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class ContactInfoBlockComponent extends GutenbergBlockComponent {
	static get blockTitle() {
		return 'Contact Info';
	}
	static get blockName() {
		return 'jetpack/contact-info';
	}
}

export { ContactInfoBlockComponent };
