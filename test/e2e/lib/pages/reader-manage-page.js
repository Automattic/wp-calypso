/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

export default class ReaderManagePage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = ReaderManagePage._getUrl();
		}
		super( driver, by.css( '.following-manage' ), url );
		this.recommendedSitesSection = by.css( '.reader-recommended-sites' );
		this.followedSitesSection = by.css( '.following-manage__subscriptions' );
	}

	async waitForSites() {
		const sitesLoadingLocator = by.css(
			'.reader-subscription-list-item  .is-placeholder:not(.reader-subscription-list-item__site-title)'
		);
		return await driverHelper.waitUntilElementNotLocated( this.driver, sitesLoadingLocator );
	}

	static _getUrl() {
		return dataHelper.getCalypsoURL( 'following/manage' );
	}
}
