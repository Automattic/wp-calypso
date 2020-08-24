/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';
import URL from 'url';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';

export default class ReaderPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = ReaderPage.getReaderURL();
		}
		super( driver, by.css( '.is-section-reader' ), url );
	}

	async siteOfLatestPost() {
		const href = await this.driver
			.findElement( by.css( '.reader-visit-link' ) )
			.getAttribute( 'href' );
		return URL.parse( href ).host;
	}

	async shareLatestPost() {
		const shareButtonSelector = by.css( '.reader-share__button' );

		// Allow the components to settle and finish loading, one hopes. There
		// continues to be errors where the test cannot find the site selector
		// below after opening the reader share button. The screencasts indicate
		// that more posts are added to the page after the share modal opens,
		// causing the share modal to close before it clicks the site button.
		await this.driver.sleep( 2000 );

		const hasSharablePost = await driverHelper.isElementPresent( this.driver, shareButtonSelector );
		if ( ! hasSharablePost ) {
			// no shareable posts on this screen. try moving into a combined card
			const firstComboCardPostSelector = by.css( '.reader-combined-card__post-title-link' );
			await driverHelper.clickWhenClickable( this.driver, firstComboCardPostSelector );
		}

		const clickAndOpenShareModal = async () => {
			await driverHelper.clickWhenClickable( this.driver, shareButtonSelector );
			await driverHelper.waitTillPresentAndDisplayed(
				this.driver,
				by.css( '.site-selector__sites' )
			);
			return await driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.site-selector__sites .site__content' )
			);
		};

		// Try a second time if the share menu is closed during the operation
		// the first time.
		let result;
		try {
			result = await clickAndOpenShareModal();
		} catch {
			result = await clickAndOpenShareModal();
		}
		return result;
	}

	async commentOnLatestPost( comment ) {
		await driverHelper.clickWhenClickable( this.driver, by.css( '.comment-button' ) );
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.comments__form textarea' ),
			comment
		);
		return await driverHelper.clickWhenClickable( this.driver, by.css( '.comments__form button' ) );
	}

	async waitForCommentToAppear( comment ) {
		const commentSelector = by.css( '.comments__comment-content' );
		return await driverHelper.verifyTextPresent( this.driver, commentSelector, comment );
	}

	static getReaderURL() {
		return dataHelper.getCalypsoURL( 'read' );
	}
}
