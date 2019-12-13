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
		const hasSharablePost = await driverHelper.isElementPresent( this.driver, shareButtonSelector );

		if ( ! hasSharablePost ) {
			// no shareable posts on this screen. try moving into a combined card
			const firstComboCardPostSelector = by.css( '.reader-combined-card__post-title-link' );
			await driverHelper.clickWhenClickable( this.driver, firstComboCardPostSelector );
		}

		await driverHelper.clickWhenClickable( this.driver, shareButtonSelector );
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.reader-popover .site__content' )
		);
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
