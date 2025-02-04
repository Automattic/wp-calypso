import _getEmbedMetadata from 'get-video-id';

/**
 * Wrapper for the get-video-id library in order to make sure that video.wordpress.com videos are
 * considered videopress.com videos. Ideally this would be fixed upstream but the library's last
 * commit at the time of writing is almost a year old ... and it's HACK week ;)
 */
export default function getEmbedMetadata( url ) {
	// Check if a Pocket Casts URL
	if ( url.indexOf( 'pca.st' ) !== -1 ) {
		const id = url.split( '/' ).pop();
		if ( id.length > 0 ) {
			return {
				id,
				service: 'pocketcasts',
			};
		}
	}
	// Fake the video domain for video.wordpress.com to look like videopress.com so the external library recognizes it.
	return _getEmbedMetadata( url.replace( 'video.wordpress', 'videopress' ) );
}
