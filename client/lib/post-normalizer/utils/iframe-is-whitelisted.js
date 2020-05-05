/**
 * External Dependencies
 */
import { some, endsWith } from 'lodash';
import url from 'url';

/**
 * Determines if an iframe is from a source we trust.  We allow these to be the featured media and also give
 * them a free-er sandbox
 *
 * @param  {object} iframe the iframe to check
 * @returns {boolean} true if whitelisted
 */
export function iframeIsWhitelisted( iframe ) {
	const iframeWhitelist = [
		'youtube.com',
		'youtube-nocookie.com',
		'videopress.com',
		'video.wordpress.com',
		'vimeo.com',
		'cloudup.com',
		'soundcloud.com',
		'8tracks.com',
		'spotify.com',
		'me.sh',
		'bandcamp.com',
		'kickstarter.com',
		'facebook.com',
		'embed.itunes.apple.com',
		'nyt.com',
		'google.com',
		'mixcloud.com',
		'players.brightcove.net',
		'embed.ted.com',
		'fast.wistia.net',
		'player.twitch.tv',
		'archive.org',
		'codepen.io',
		'www.audiomack.com',
		'player.theplatform.com',
		'embed.radiopublic.com',
		'gfycat.com',
		'scribd.com',
		'megaphone.fm',
		'icloud.com',
		'read.amazon.com',
	];
	const hostName = iframe.src && url.parse( iframe.src ).hostname;
	const iframeSrc = hostName && hostName.toLowerCase();
	return some( iframeWhitelist, function ( whitelistedSuffix ) {
		return endsWith( '.' + iframeSrc, '.' + whitelistedSuffix );
	} );
}
