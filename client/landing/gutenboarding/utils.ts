/*
 getIsAnchorFmSignup is a utility function for parsing the anchor_podcast parameter from a given URL
*/
export function getIsAnchorFmSignup( urlString: string ): boolean {
	if ( ! urlString ) {
		return false;
	}

	// Assemble search params if there is actually a query in the string.
	const queryParamIndex = urlString.indexOf( '?' );
	if ( queryParamIndex === -1 ) {
		return false;
	}
	const searchParams = new URLSearchParams( urlString.slice( queryParamIndex ) );
	const anchorFmPodcastId = searchParams.get( 'anchor_podcast' );
	return Boolean( anchorFmPodcastId && anchorFmPodcastId.match( /^[0-9a-f]{7,8}$/i ) );
}
