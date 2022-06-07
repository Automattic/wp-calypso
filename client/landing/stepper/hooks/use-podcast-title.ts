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
		let isMounted = true;

		if ( ! anchorFmPodcastId ) {
			return;
		}

		// Fetch podcast title from /podcast-details endpoint
		apiFetch< PodcastDetails >( {
			path: `https://public-api.wordpress.com/wpcom/v2/podcast-details?url=https://anchor.fm/s/${ encodeURIComponent(
				anchorFmPodcastId
			) }/podcast/rss&_fields=title`,
		} )
			.then( ( response ) => {
				if ( response?.title && isMounted ) {
					setSiteTitle( response.title );
				}
			} )
			.catch( () => {
				isMounted && setSiteTitle( '' );
			} );
		return () => {
			isMounted = false;
		}; //Cleanup when we've finished mounting
	}, [ anchorFmPodcastId ] );

	return siteTitle;
}
