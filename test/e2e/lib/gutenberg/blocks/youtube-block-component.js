/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import GutenbergBlockComponent from './gutenberg-block-component';

class YoutubeBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'YouTube';
	static blockName = 'core/embed';
	static blockFrontendSelector = By.css(
		'.entry-content figure.wp-block-embed iframe.youtube-player'
	);
}

export { YoutubeBlockComponent };
