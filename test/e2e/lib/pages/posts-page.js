/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper';
import { currentScreenSize } from '../driver-manager';

export default class PostsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.posts' ) );
	}

	async waitForPosts() {
		const resultsLoadingLocator = By.css( '.posts__post-list .is-placeholder:not(.post)' );
		return await driverHelper.waitUntilElementNotLocated( this.driver, resultsLoadingLocator );
	}

	async addNewPost() {
		const addNewPostLocator = By.css( '.post-type-list__add-post' );
		return await driverHelper.clickWhenClickable( this.driver, addNewPostLocator );
	}

	async waitForPostTitled( title ) {
		return await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			PostsPage.getPostTitleLocator( title )
		);
	}

	async isPostDisplayed( title ) {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			PostsPage.getPostTitleLocator( title )
		);
	}

	async editPostWithTitle( title ) {
		return await driverHelper.clickWhenClickable(
			this.driver,
			PostsPage.getPostTitleLocator( title ),
			this.explicitWaitMS * 2
		);
	}

	async openSectionNav() {
		const isOpen = await driverHelper.isElementLocated(
			this.driver,
			By.css( '.post-type-filter .section-nav.is-open' )
		);
		if ( currentScreenSize() === 'mobile' && ! isOpen ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.section-nav__mobile-header' )
			);
		}
	}

	async viewMyPosts() {
		await this.openSectionNav();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.post-type-filter li.segmented-control__item a[ href*="/my/" ]' )
		);
	}

	async viewDrafts() {
		await this.openSectionNav();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.post-type-filter li.section-nav-tab a[ href*="/drafts/" ]' )
		);
	}

	async isPostPending() {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( '.post-status.is-pending' )
		);
	}

	static getPostTitleLocator( title ) {
		return By.css( `.post-item__title-link[data-e2e-title="${ title }"]` );
	}
}
