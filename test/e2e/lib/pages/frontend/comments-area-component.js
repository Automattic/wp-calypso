import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class CommentsAreaComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#comments.comments-area' ) );
	}

	/**
	 * Posts the first comment to a post (under "Join the Conversation" in the footer).
	 *
	 * @param { string } comment The comment text.
	 */
	async _postComment( comment ) {
		const commentField = By.css( '#comment' );
		const submitButton = By.css( '#comment-submit' );

		await driverHelper.scrollIntoView( this.driver, commentField );
		await driverHelper.setWhenSettable( this.driver, commentField, comment );
		await driverHelper.scrollIntoView( this.driver, submitButton );
		await driverHelper.clickWhenClickable( this.driver, submitButton );
	}

	/**
	 * Posts a reply to a comment. Re-uses most of @see _postComment, but starts
	 * the action by clicking the "Reply" link for an existing comment.
	 *
	 * @param {*} comment The comment text.
	 */
	async reply( comment ) {
		const replyButton = By.css( '.comment-reply-link' );

		await driverHelper.clickWhenClickable( this.driver, replyButton );
		await this._postComment( comment );
	}

	/**
	 * Verifies if a comment is visible. If you tweak the depth, you can also
	 * "point" it to a reply comment.
	 *
	 * @param { string } comment The comment text.
	 * @param { number } depth How nested you want to check. The first comment has
	 * a depth of 1, while the first reply to it would have a depth of 2.
	 */
	async verifyCommentIsVisible( comment, depth = 1 ) {
		const commentLocator = By.xpath(
			`//li[contains(@class,'depth-${ depth }')]//div[@class='comment-content']/p[.='${ comment }']`
		);

		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, commentLocator );
	}
}
