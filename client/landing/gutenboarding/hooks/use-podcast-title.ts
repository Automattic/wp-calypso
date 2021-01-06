/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { useAnchorFmParams } from '../path';

export default function usePodcastTitle(): string | null {
	const [ podcastTitle, setPodcastTitle ] = useState< string | null >( '' );
	const { anchorFmPodcastId } = useAnchorFmParams();

	useEffect( () => {
		if ( ! anchorFmPodcastId ) {
			return;
		}
		// Fetch podcast title from /podcast-details endpoint
		apiFetch( {
			path: `https://public-api.wordpress.com/wpcom/v2/podcast-details?url=https://anchor.fm/s/${ encodeURIComponent(
				anchorFmPodcastId
			) }/podcast/rss&_fields=title`,
		} )
			.then( ( response ) => {
				setPodcastTitle( response?.title );
			} )
			.catch( () => {
				setPodcastTitle( null );
			} );
	}, [ anchorFmPodcastId ] );
	return podcastTitle;
}
