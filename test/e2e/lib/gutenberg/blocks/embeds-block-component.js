/**
 * External dependencies
 */
import assert from 'assert';
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import GutenbergBlockComponent from './gutenberg-block-component';

export default class EmbedsBlockComponent extends GutenbergBlockComponent {
	async embedUrl( url ) {
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( `${ this.blockID } .components-placeholder__input` ),
			url
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `${ this.blockID } .wp-block-embed .components-button` )
		);
		return await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( `${ this.blockID } .wp-block-image .components-spinner` )
		);
	}

	async isEmbeddedInEditor( selector ) {
		const element = By.css( `${ this.blockID } ${ selector }` );
		const displayed = await driverHelper.isEventuallyPresentAndDisplayed( this.driver, element );
		return assert.strictEqual(
			displayed,
			true,
			`Editor does not contain ${ selector } element for embedded url.`
		);
	}
}
