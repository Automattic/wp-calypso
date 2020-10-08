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

	async embed( videoURL ) {
		const embedInput = await this.driver.findElement(
			By.css( `${ this.blockID } input[type='url']` )
		);
		const embedButton = await this.driver.findElement(
			By.css( `${ this.blockID } button[type='submit']` )
		);

		await embedInput.sendKeys( videoURL );
		await embedButton.click();
	}
}

export { YoutubeBlockComponent };
