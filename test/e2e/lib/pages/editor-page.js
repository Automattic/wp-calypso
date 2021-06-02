/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';

import AsyncBaseContainer from '../async-base-container';

export default class EditorPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.post-editor' ), dataHelper.getCalypsoURL( 'post' ) );
	}

	async _postInit() {
		const contentLocator = By.css( '.is-section-post-editor' );
		const settingsButtonLocator = By.css( 'button.editor-ground-control__toggle-sidebar' );
		const editorFrameLocator = By.css( '.mce-edit-area iframe' );
		const contentElementClasses = await driverHelper
			.waitUntilElementLocatedAndVisible( this.driver, contentLocator )
			.getAttribute( 'class' );

		if ( -1 === contentElementClasses.indexOf( 'focus-content' ) ) {
			await driverHelper.clickWhenClickable( this.driver, settingsButtonLocator );
		}

		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, editorFrameLocator );
	}
}
