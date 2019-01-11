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

	const bestResolution = [ 'hd', 'dvd', 'std' ].find( resolution => {
		return !! videoPressData.files_status[ resolution ];
	} );

	const bestFormat = [ 'mp4', 'ogv' ].find( format => {
		return !! videoPressData.files_status[ bestResolution ][ format ];
	} );

	return `${ videoPressData.file_url_base.https }${
		videoPressData.files[ bestResolution ][ bestFormat ]
	}`;
};

export default getVideoPressUrl;
