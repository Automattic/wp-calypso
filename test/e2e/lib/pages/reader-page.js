/** @format */

import { By as by } from 'selenium-webdriver';
import URL from 'url';

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
		let href = await this.driver
			.findElement( by.css( '.reader-visit-link' ) )
			.getAttribute( 'href' );
		return URL.parse( href ).host;
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
		let commentSelector = by.css( '.comments__comment-content' );
		return await driverHelper.verifyTextPresent( this.driver, commentSelector, comment );
	}

	static getReaderURL() {
		return dataHelper.getCalypsoURL( 'read' );
	}
}
