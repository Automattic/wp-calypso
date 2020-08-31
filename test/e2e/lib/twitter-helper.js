/**
 * External dependencies
 */
import config from 'config';
import request from 'request-promise';

const twitterAPI = config.get( 'twitterAPI' );
const twitterBearerToken = config.get( 'twitterBearerToken' );
const publicizeTwitterAccount = config.get( 'publicizeTwitterAccount' );

export async function latestTweetsContain( expectedTweetText ) {
	let tweetFound = false;
	let i = 0;
	while ( i < 10 && ! tweetFound ) {
		await sleep( 4000 );
		const tweetsURL = `${ twitterAPI }/statuses/user_timeline.json?screen_name=${ publicizeTwitterAccount }&count=20`;
		const response = await request.get( {
			headers: { Authorization: 'Bearer ' + twitterBearerToken },
			url: tweetsURL,
		} );
		if ( response && response.length > 1 ) {
			const tweets = JSON.parse( response );
			if ( tweets[ i ].text.includes( expectedTweetText ) ) tweetFound = true;
		}

		i++;
	}
	return tweetFound;
}

function sleep( ms ) {
	return new Promise( ( resolve ) => {
		setTimeout( resolve, ms );
	} );
}
