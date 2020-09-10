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
		const blockDivSelector = `div[id='${ this.blockID.slice( 1 ) }']`;

		const embedInput = await this.driver.findElement(
			By.css( `${ blockDivSelector } input[type='url']` )
		);
		const embedButton = await this.driver.findElement(
			By.css( `${ blockDivSelector } button[type='submit']` )
		);

		await embedInput.sendKeys( videoURL );
		await embedButton.click();
	}
}

export { YoutubeBlockComponent };
