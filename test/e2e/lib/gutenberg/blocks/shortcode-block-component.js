/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export class ShortcodeBlockComponent extends GutenbergBlockComponent {
	async enterShortcode( shortcode ) {
		const shortcodeSelector = By.css( 'textarea.editor-plain-text' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, shortcodeSelector );
		const shortcodeTextarea = await this.driver.findElement( shortcodeSelector );
		return await shortcodeTextarea.sendKeys( shortcode );
	}
}
