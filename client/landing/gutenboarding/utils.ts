/*
 getIsAnchorFmSignup is a utility function for parsing the anchor_podcast parameter from a given URL
*/
export function getIsAnchorFmSignup( urlString: string ): boolean {
	if ( ! urlString ) {
		return false;
	}
	const url = new URL( urlString, window.location.origin );
	const decodedUrl = decodeURIComponent( url.search );
	const searchParams = new URLSearchParams( decodedUrl );
	const anchorFmPodcastId = searchParams.get( 'anchor_podcast' );
	return Boolean( anchorFmPodcastId && anchorFmPodcastId.match( /^[0-9a-f]{7,8}$/i ) );
}
