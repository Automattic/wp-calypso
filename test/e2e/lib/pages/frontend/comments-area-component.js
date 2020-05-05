/**
 * External dependencies
 */
import { By, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import * as dataHelper from '../../data-helper';

import AsyncBaseContainer from '../../async-base-container';

export default class CommentsAreaComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#comments.comments-area' ) );
	}

	async _postComment( { comment } ) {
		const commentForm = By.css( '#commentform' );
		const commentField = By.css( '#comment' );
		const submitButton = By.css( ".form-submit[style='display: block;'] #comment-submit" );
		const commentContent = By.xpath( `//div[@class='comment-content']/p[.='${ comment }']` );

		await driverHelper.scrollIntoView( this.driver, commentForm, 'end' );
		await driverHelper.clickWhenClickable( this.driver, commentForm );
		await driverHelper.scrollIntoView( this.driver, commentForm, 'end' );
		await this.switchToFrameIfJetpack();

		await driverHelper.clickWhenClickable( this.driver, commentForm );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, submitButton );
		await driverHelper.scrollIntoView( this.driver, submitButton );
		await driverHelper.setWhenSettable( this.driver, commentField, comment );
		await driverHelper.clickWhenClickable( this.driver, submitButton );
		await this.driver.switchTo().defaultContent();
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, commentContent );
	}

	async reply( commentObj, depth = 2 ) {
		const replyButton = By.css( '.comment-reply-link' );
		const replyContent = By.xpath(
			`//li[contains(@class,'depth-${ depth }')]//div[@class='comment-content']/p[.='${ commentObj.comment }']`
		);
		await driverHelper.clickWhenClickable( this.driver, replyButton );
		await this._postComment( commentObj );
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, replyContent );
	}

	async switchToFrameIfJetpack() {
		if ( dataHelper.getJetpackHost() === 'WPCOM' ) {
			return false;
		}
		await this.driver.sleep( 1000 );

		const iFrameSelector = By.css( 'iframe.jetpack_remote_comment' );

		await this.driver.switchTo().defaultContent();
		await driverHelper.waitTillPresentAndDisplayed( this.driver, iFrameSelector );
		await this.driver.wait(
			until.ableToSwitchToFrame( iFrameSelector ),
			this.explicitWaitMS,
			'Could not switch to comment form iFrame'
		);
	}
}
