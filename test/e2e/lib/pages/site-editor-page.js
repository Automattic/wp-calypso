/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as dataHelper from '../data-helper';
import AsyncBaseContainer from '../async-base-container';

export default class SiteEditorPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = SiteEditorPage._getUrl();
		}
		super( driver, By.css( '.is-section-gutenberg-editor' ), url );
	}

	async _postInit() {
		await this.waitForPage();
	}

	static _getUrl() {
		return dataHelper.getCalypsoURL( 'site-editor' );
	}
}
