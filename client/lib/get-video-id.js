import _getEmbedMetadata from 'get-video-id';

/**
 * Wrapper for the get-video-id library in order to make sure that video.wordpress.com videos are
 * considered videopress.com videos. Ideally this would be fixed upstream but the library's last
 * commit at the time of writing is almost a year old ... and it's HACK week ;)
 */
export default function getEmbedMetadata( url ) {
	// Fake the video domain for video.wordpress.com to look like videopress.com so the external library recognizes it.
	return _getEmbedMetadata( url.replace( 'video.wordpress', 'videopress' ) );
}
