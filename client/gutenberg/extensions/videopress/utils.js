/** @format */

/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';

export const isVideoPressUrl = url => url.includes( 'videos.files.wordpress.com' );

export const getVideoPressUrl = async videoId => {
	if ( ! videoId ) {
		return;
	}

	const videoData = await apiFetch( {
		path: `/wp/v2/media/${ videoId }`,
	} );

	if ( ! videoData.jetpack_videopress ) {
		return;
	}

	const {
		jetpack_videopress: {
			files_status: filesStatus,
			file_url_base: { https: fileUrlBase },
			files,
		},
	} = videoData;

	const bestResolution = [ 'hd', 'dvd', 'std' ].find( resolution => {
		return !! filesStatus[ resolution ];
	} );

	const bestFormat = [ 'mp4', 'ogv' ].find( format => {
		return 'DONE' === filesStatus[ bestResolution ][ format ];
	} );

	if ( ! bestResolution || ! bestFormat ) {
		return;
	}

	return `${ fileUrlBase }${ files[ bestResolution ][ bestFormat ] }`;
};
