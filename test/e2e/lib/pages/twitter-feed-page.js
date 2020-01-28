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
import { getElementCount } from '../driver-helper';

export default class TwitterFeedPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			const publicizeTwitterAccount = config.has( 'publicizeTwitterAccount' )
				? config.get( 'publicizeTwitterAccount' )
				: '';
			url = `https://twitter.com/${ publicizeTwitterAccount }`;
		}
		super( driver, by.css( '#timeline, div[data-testid*=tweet]' ), url );
	}

	async checkLatestTweetsContain( expectedTweetText ) {
		const driver = this.driver;
		return await driver
			.wait( async function() {
				await driver.navigate().refresh();
				return await getElementCount(
					driver,
					by.css( '.stream-item, div[data-testid*=tweet]' )
				).then( tweetCount => {
					if ( tweetCount >= 5 ) {
						return driver.getPageSource().then( function( source ) {
							return source.indexOf( expectedTweetText ) > -1;
						} );
					}
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
