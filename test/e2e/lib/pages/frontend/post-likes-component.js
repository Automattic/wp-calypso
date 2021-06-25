/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';
export default class PostLikesComponent extends AsyncBaseContainer {
	/**
	 * Encapsulates the iframe switching required to click on
	 * post like buttons and assert their "Liked" state
	 *
	 * @param driver WebDriver driver
	 * @param url Url of the post where the likes widget can be found
	 */
	constructor( driver, url ) {
		super( driver, By.css( 'iframe.post-likes-widget' ), url );
	}

	async _preInit() {
		// Ensure we're starting from the top frame before expecting on this.expectedElementLocator
		await this.driver.switchTo().defaultContent();
	}

	async clickLike() {
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, this.expectedElementLocator );
		const likeButton = By.css( '.like.sd-button' );
		await driverHelper.scrollIntoView( this.driver, likeButton );
		await driverHelper.clickWhenClickable( this.driver, likeButton );
		await this.driver.switchTo().defaultContent();
	}

	async expectLiked() {
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, this.expectedElementLocator );
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.xpath( `//span[@class='wpl-count-text'][.='You like this.']` )
		);
		await this.driver.switchTo().defaultContent();
	}

	async clickUnlike() {
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, this.expectedElementLocator );
		const likedButton = By.css( '.liked.sd-button' );
		await driverHelper.scrollIntoView( this.driver, likedButton );
		await driverHelper.clickWhenClickable( this.driver, likedButton );
		await this.driver.switchTo().defaultContent();
	}

	async expectNotLiked() {
		await driverHelper.waitUntilAbleToSwitchToFrame( this.driver, this.expectedElementLocator );
		await driverHelper.waitUntilElementLocatedAndVisible(
			this.driver,
			By.xpath( `//span[@class='wpl-count-text'][.='Be the first to like this.']` )
		);
		await this.driver.switchTo().defaultContent();
	}
}
