/**
 * Returns global flag indicating whether the blog is private or not.
 *
 * @return {boolean|undefined} private blog flag
 */
export function getIsBlogPrivate() {
	if ( typeof window !== 'object' ) {
		return undefined;
	}

	if ( typeof window.newspackIsBlogPrivate === 'undefined' ) {
		return undefined;
	}

	return Boolean( window.newspackIsBlogPrivate );
}
