import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container.js';
import * as dataHelper from '../data-helper.js';
import * as driverHelper from '../driver-helper.js';

export default class ReaderManagePage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = ReaderManagePage._getUrl();
		}
		super( driver, By.css( '.following-manage' ), url );
		this.recommendedSitesSection = By.css( '.reader-recommended-sites' );
		this.followedSitesSection = By.css( '.following-manage__subscriptions' );
	}

	async waitForSites() {
		const sitesLoadingLocator = By.css(
			'.reader-subscription-list-item  .is-placeholder:not(.reader-subscription-list-item__site-title)'
		);
		return await driverHelper.waitUntilElementNotLocated( this.driver, sitesLoadingLocator );
	}

	static _getUrl() {
		return dataHelper.getCalypsoURL( 'following/manage' );
	}
}
