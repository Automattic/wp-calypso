/**
 * Extracts YouTube video ID from various URL formats
 * @param link - YouTube URL
 * @returns YouTube video ID or empty string
 */
const getYouTubeVideoId = ( link: string ): string => {
	if ( ! link ) {
		return '';
	}

	try {
		const url = new URL( link );

		// ?v=ID
		const v = url.searchParams.get( 'v' );
		if ( v ) {
			return v;
		}

		// /embed/ID, /v/ID, youtu.be/ID
		const match = url.pathname.match( /\/(embed|v)?\/?([a-zA-Z0-9_-]{11})/ );
		return match?.[ 2 ] ?? '';
	} catch {
		return '';
	}
};

/**
 * Converts a YouTube watch URL to an embed URL
 * @param link - YouTube URL (watch or embed format)
 * @returns YouTube embed URL
 */
export const getYouTubeEmbedUrl = ( link: string ): string => {
	const id = getYouTubeVideoId( link );
	return id ? `https://www.youtube.com/embed/${ id }` : '';
};
