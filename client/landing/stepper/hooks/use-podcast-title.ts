import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from 'react';
import { useAnchorFmParams } from './use-anchor-fm-params';

export default function usePodcastTitle(): string | null {
	const { anchorFmPodcastId } = useAnchorFmParams();
	const [ siteTitle, setSiteTitle ] = useState( '' );
	interface PodcastDetails {
		title?: string;
	}

	useEffect( () => {
		if ( ! anchorFmPodcastId ) {
			return;
		}

		//Prevent memory leak when API has not finished fetching/component has not mounted
		const controller = new AbortController();
		const signal = controller.signal;

		// Fetch podcast title from /podcast-details endpoint
		apiFetch< PodcastDetails >( {
			path: `https://public-api.wordpress.com/wpcom/v2/podcast-details?url=https://anchor.fm/s/${ encodeURIComponent(
				anchorFmPodcastId
			) }/podcast/rss&_fields=title`,
			signal: signal,
		} )
			.then( ( response ) => {
				if ( response?.title ) {
					setSiteTitle( response.title );
				}
			} )
			.catch( () => {
				setSiteTitle( '' );
			} );
		return () => controller.abort(); //Cleanup when we've finished mounting
	}, [ anchorFmPodcastId ] );

	return siteTitle;
}
