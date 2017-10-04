/**
 * @format
 */

const acceptedProtocolRe = /^https?:\/\//;

export default function makeLinksSafe( post ) {
	if ( post && post.URL && ! acceptedProtocolRe.test( post.URL ) ) {
		post.URL = '';
	}

	if ( post && post.short_URL && ! acceptedProtocolRe.test( post.short_URL ) ) {
		post.short_URL = '';
	}
	return post;
}
