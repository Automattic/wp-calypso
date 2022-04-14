export function getAnchorPodcastId() {
	/* @TODO: hook this up to the store and make it an actual hook :) */
	const sanitizePodcastId = ( id: string | null ) => id?.replace( /[^a-zA-Z0-9]/g, '' );
	const search = location.search;

	const anchorPodcastId = sanitizePodcastId(
		new URLSearchParams( search ).get( 'anchor_podcast' )
	);

	if ( anchorPodcastId ) {
		return anchorPodcastId;
	}
	return null;
}
