/**
 * External dependencies
 */
import { By as by } from 'selenium-webdriver';
import config from 'config';

/**
 * Internal dependencies
 */
import * as slackNotifier from '../slack-notifier';
import AsyncBaseContainer from '../async-base-container';

export default class TwitterFeedPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			const publicizeTwitterAccount = config.has( 'publicizeTwitterAccount' )
				? config.get( 'publicizeTwitterAccount' )
				: '';
			url = `https://twitter.com/${ publicizeTwitterAccount }`;
		}
		super( driver, by.css( '#timeline' ), url );
	}

	async checkLatestTweetsContain( expectedTweetText ) {
		const driver = this.driver;
		return await driver
			.wait( function() {
				driver.navigate().refresh();
				return driver.getPageSource().then( function( source ) {
					return source.indexOf( expectedTweetText ) > -1;
				} );
			}, this.explicitWaitMS )
			.then(
				() => {},
				() => {
					slackNotifier.warn(
						`The twitter page does not contain the expected tweet text ('${ expectedTweetText }') after waiting for it to appear. Please manually check that this eventually appears.`,
						{ suppressDuplicateMessages: true }
					);
				}
			);
	}
}
