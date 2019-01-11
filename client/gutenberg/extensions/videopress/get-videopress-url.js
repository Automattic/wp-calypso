/** @format */

/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';

const getVideoPressUrl = async videoId => {
	if ( ! videoId ) {
		return;
	}

	const videoData = await apiFetch( {
		path: `/rest/v1.1/media/${ videoId }`,
	} );

	if ( ! videoData.videopress_guid ) {
		return;
	}

	const videoPressData = await apiFetch( {
		path: `/rest/v1.1/videos/${ videoData.videopress_guid }`,
		addSiteSlug: false,
	} );

	const {
		files_status: filesStatus,
		file_url_base: { https: fileUrlBase },
		files,
	} = videoPressData;

	const bestResolution = [ 'hd', 'dvd', 'std' ].find( resolution => {
		return !! filesStatus[ resolution ];
	} );

	const bestFormat = [ 'mp4', 'ogv' ].find( format => {
		return 'DONE' === filesStatus[ bestResolution ][ format ];
	} );

	if ( ! bestResolution || ! bestFormat ) {
		return null;
	}

	return `${ fileUrlBase }${ files[ bestResolution ][ bestFormat ] }`;
};

export default getVideoPressUrl;
