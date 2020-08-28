/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class ContactInfoBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'Contact Info';
	static blockName = 'jetpack/contact-info';
	static blockFrontendSelector = By.css( '.entry-content .wp-block-jetpack-contact-info' );
}

export { ContactInfoBlockComponent };
