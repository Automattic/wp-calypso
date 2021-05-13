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
		const shortcodeLocator = By.css( 'textarea.editor-plain-text' );
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, shortcodeLocator );
		const shortcodeTextarea = await this.driver.findElement( shortcodeLocator );
		return await shortcodeTextarea.sendKeys( shortcode );
	}
}
