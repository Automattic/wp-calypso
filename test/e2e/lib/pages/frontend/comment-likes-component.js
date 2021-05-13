/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class CommentLikesComponent extends AsyncBaseContainer {
	/**
	 * Encapsulates post comment like clicks and assertions
	 *
	 * @param driver WebDriver driver
	 * @param comment Text used to locate the comment under test
	 * @param url Url of the post where the comment can be found
	 */
	constructor( driver, comment, url ) {
		super( driver, By.xpath( `//div[@class='comment-content']/p[.='${ comment }']` ), url );
		this.comment = comment;
	}

	static async Expect( driver, comment ) {
		const page = new this( driver, comment );
		await page._expectInit();
		return page;
	}

	static async Visit( driver, comment, url ) {
		const page = new this( driver, comment, url );
		await page._visitInit();
		return page;
	}

	async likeComment() {
		const commentLikeLink = By.xpath(
			`//div[@class='comment-content']/p[.='${ this.comment }']/../p/a[@class='comment-like-link']`
		);

		// Scrolling 100px prevents the action bar from covering the like button on mobile
		// causing test failures
		await driverHelper.scrollIntoView( this.driver, commentLikeLink, 'end' );
		await this.driver.executeScript( 'window.scrollBy(0, 100)' );
		await driverHelper.clickWhenClickable( this.driver, commentLikeLink );
	}
	async expectLiked() {
		const commentLikedText = By.xpath(
			`//div[@class='comment-content']/p[.='${ this.comment }']/../p/span[starts-with(text(),'Liked by')]`
		);
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, commentLikedText );
	}
	async unlikeComment() {
		const commentUnLikeLink = By.xpath(
			`//div[@class='comment-content']/p[.='${ this.comment }']/../p[@class='comment-likes comment-liked']/a[@class='comment-like-link']`
		);

		// Scrolling 100px prevents the action bar from covering the like button on mobile
		// causing test failures
		await driverHelper.scrollIntoView( this.driver, commentUnLikeLink, 'end' );
		await this.driver.executeScript( 'window.scrollBy(0, 100)' );
		await driverHelper.clickWhenClickable( this.driver, commentUnLikeLink );
	}
	async expectNotLiked() {
		const commentUnLikedText = By.xpath(
			`//div[@class='comment-content']/p[.='${ this.comment }']/../p/span[starts-with(text(),'Like')]`
		);
		await driverHelper.waitUntilElementLocatedAndVisible( this.driver, commentUnLikedText );
	}
}
