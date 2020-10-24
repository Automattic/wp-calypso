/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

class YoutubeBlockComponent extends GutenbergBlockComponent {
	static blockTitle = 'YouTube';
	static blockName = 'core/embed';
	static blockFrontendSelector = By.css(
		'.entry-content figure.wp-block-embed iframe.youtube-player'
	);

	async embed( videoURL ) {
		const embedInputSelector = By.css( `${ this.blockID } input[type='url']` );
		const embedButtonSelector = By.css( `${ this.blockID } button[type='submit']` );

		await driverHelper.setWhenSettable( this.driver, embedInputSelector, videoURL );
		await driverHelper.clickWhenClickable( this.driver, embedButtonSelector );
	}
}

export { YoutubeBlockComponent };
