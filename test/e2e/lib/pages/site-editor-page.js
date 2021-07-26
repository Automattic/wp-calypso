import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as dataHelper from '../data-helper';

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
