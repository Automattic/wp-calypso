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
	static blockFrontendLocator = By.css(
		'.entry-content figure.wp-block-embed iframe.youtube-player'
	);

	async embed( videoURL ) {
		const embedInputLocator = By.css( `${ this.blockID } input[type='url']` );
		const embedButtonLocator = By.css( `${ this.blockID } button[type='submit']` );

		await driverHelper.setWhenSettable( this.driver, embedInputLocator, videoURL );
		await driverHelper.clickWhenClickable( this.driver, embedButtonLocator );
	}
}

export { YoutubeBlockComponent };
